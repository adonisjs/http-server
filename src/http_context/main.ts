/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { inspect } from 'node:util'
import Macroable from '@poppinss/macroable'
import type { Logger } from '@adonisjs/logger'
import { type ContainerResolver } from '@adonisjs/fold'
import { RuntimeException } from '@poppinss/utils/exception'

import type { HttpRequest } from '../request.ts'
import type { HttpResponse } from '../response.ts'
import type { RouteJSON } from '../types/route.ts'
import { asyncLocalStorage } from './local_storage.ts'

/**
 * A no-op function used to attach inert handlers around the waitUntil
 * machinery, so a rejected scheduled promise or a throwing logger never
 * surfaces as an unhandled rejection
 */
const noop = () => {}

/**
 * HTTP context encapsulates all properties and services for a given HTTP request.
 *
 * The HttpContext class serves as the central hub for request-specific data and services.
 * It provides access to the request, response, route information, container resolver,
 * and logger instances. The context can be extended using macros and getters for
 * application-specific functionality.
 *
 * @example
 * ```ts
 * export default class UsersController {
 *   async show({ request, response, params }: HttpContext) {
 *     const user = await User.find(params.id)
 *     return response.json(user)
 *   }
 * }
 * ```
 */
export class HttpContext extends Macroable {
  /**
   * Indicates whether async local storage is enabled for HTTP requests.
   *
   * When enabled, the HTTP context is automatically available within the
   * scope of request processing through static methods like get() and getOrFail().
   */
  static get usingAsyncLocalStorage(): boolean {
    return asyncLocalStorage.isEnabled
  }

  /**
   * Get access to the current HTTP context from async local storage.
   *
   * This method is only available when async local storage is enabled.
   * Returns null if called outside of an HTTP request context.
   *
   * @example
   * ```ts
   * const ctx = HttpContext.get()
   * if (ctx) {
   *   console.log(ctx.request.url())
   * }
   * ```
   */
  static get(): HttpContext | null {
    if (!this.usingAsyncLocalStorage || !asyncLocalStorage.storage) {
      return null
    }

    return asyncLocalStorage.storage.getStore() || null
  }

  /**
   * Get the HttpContext instance or raise an exception if not available.
   *
   * This method is useful when you need guaranteed access to the HTTP context
   * and want to fail fast if it's not available.
   *
   * @throws RuntimeException when async local storage is disabled or context is unavailable
   *
   * @example
   * ```ts
   * const ctx = HttpContext.getOrFail()
   * const userId = ctx.request.input('user_id')
   * ```
   */
  static getOrFail(): HttpContext {
    /**
     * Localstorage is not enabled
     */
    if (!this.usingAsyncLocalStorage || !asyncLocalStorage.storage) {
      throw new RuntimeException(
        'HTTP context is not available. Enable "useAsyncLocalStorage" inside "config/app.ts" file'
      )
    }

    const store = this.get()
    if (!store) {
      throw new RuntimeException('Http context is not available outside of an HTTP request')
    }

    return store
  }

  /**
   * Run a method outside of the HTTP context scope.
   *
   * This method allows you to execute code that should not have access to
   * the current HTTP context from async local storage. Useful for background
   * tasks or operations that should be context-independent.
   *
   * @param callback - Function to execute outside the context
   * @param args - Arguments to pass to the callback
   *
   * @example
   * ```ts
   * HttpContext.runOutsideContext(() => {
   *   // This code cannot access HttpContext.get()
   *   performBackgroundTask()
   * })
   * ```
   */
  static runOutsideContext<T>(callback: (...args: any[]) => T, ...args: any[]): T {
    if (!asyncLocalStorage.storage) {
      return callback(...args)
    }

    return asyncLocalStorage.storage.exit(callback, ...args)
  }

  /**
   * Reference to the current route. Not available inside
   * server middleware
   */
  route?: RouteJSON

  /**
   * A unique key for the current route
   */
  routeKey?: string

  /**
   * Route params
   */
  params: Record<string, any> = {}

  /**
   * Route subdomains
   */
  subdomains: Record<string, any> = {}

  /**
   * Promises scheduled via "waitUntil()" for the current request. The queue
   * is created lazily when the first promise is scheduled
   */
  #waitUntilQueue?: PromiseLike<unknown>[]

  /**
   * Resolved when all the scheduled promises have settled. It is created
   * lazily along with the queue and awaited by the server inside
   * "server.handle()"
   */
  #waitUntilGate?: Promise<void>

  /**
   * Reference to the waitUntil gate resolver
   */
  #waitUntilGateResolve?: () => void

  /**
   * Whether the waitUntil queue has already been drained for this request
   */
  #waitUntilSettled = false

  /**
   * Creates a new HttpContext instance
   *
   * @param {HttpRequest} request - The HTTP request instance
   * @param {HttpResponse} response - The HTTP response instance
   * @param {Logger} logger - The logger instance
   * @param {ContainerResolver<any>} containerResolver - The IoC container resolver
   */
  constructor(
    public request: HttpRequest,
    public response: HttpResponse,
    public logger: Logger,
    public containerResolver: ContainerResolver<any>
  ) {
    super()

    /*
     * Creating the circular reference. We do this, since request and response
     * are meant to be extended and at times people would want to access
     * other ctx properties like `logger`, `profiler` inside those
     * extended methods.
     */
    this.request.ctx = this
    this.response.ctx = this
  }

  /**
   * Schedule a promise to be settled after the response for the current
   * request has been sent to the client.
   *
   * The promise is expected to be already started; it does not block the
   * response. Multiple promises may be scheduled for the same request; they
   * are settled in parallel and a rejected promise will not cancel the
   * others. Rejections are logged using the request-scoped logger. The
   * promise returned by "server.handle()" resolves only after all the
   * scheduled promises have settled.
   *
   * Promises scheduled after the response has been sent but before the
   * lifecycle has completed join the next drain wave. Scheduling after the
   * lifecycle has completed raises an exception.
   *
   * @throws RuntimeException when the request lifecycle has completed
   *
   * @example
   * ```ts
   * ctx.waitUntil(fetch('https://analytics.example.com/collect', {
   *   method: 'POST',
   *   body: JSON.stringify({ url: ctx.request.url() }),
   * }))
   * ```
   */
  waitUntil(promise: PromiseLike<unknown>): void {
    if (this.#waitUntilSettled) {
      throw new RuntimeException(
        'Cannot schedule work using "waitUntil()" after the request lifecycle has completed'
      )
    }

    this.#waitUntilQueue ??= []
    this.#waitUntilQueue.push(promise)

    /**
     * Attach an inert handler to the scheduled promise, so it cannot raise
     * an unhandled rejection in the window between being scheduled and
     * the response being finished. The original promise still flows to
     * "Promise.allSettled" unchanged
     */
    void Promise.resolve(promise).then(noop, noop)

    /**
     * Listen for the response finish event only when someone has actually
     * scheduled work. This keeps the request lifecycle cost-free when
     * the feature is not used
     */
    if (!this.#waitUntilGate) {
      this.#waitUntilGate = new Promise((resolve) => {
        this.#waitUntilGateResolve = resolve
      })

      this.response.onFinish(() => {
        /**
         * The drain never rejects (rejections are logged and swallowed), but
         * keep the fire-and-forget call safe if the logger itself throws
         */
        void this.#drainWaitUntil().catch(noop)
      })
    }
  }

  /**
   * Returns the promise resolved once all the scheduled promises have
   * settled. It is used internally by the server to await post-response
   * work inside "server.handle()"
   */
  get waitUntilGate(): Promise<void> | undefined {
    return this.#waitUntilGate
  }

  /**
   * Settles all the scheduled promises. Promises scheduled while the queue
   * is being drained join the next wave
   */
  async #drainWaitUntil(): Promise<void> {
    try {
      while (this.#waitUntilQueue!.length) {
        const wave = this.#waitUntilQueue!.splice(0)
        const results = await Promise.allSettled(wave)

        for (const result of results) {
          if (result.status === 'rejected') {
            this.logger.error({ err: result.reason }, 'waitUntil callback rejected')
          }
        }
      }
    } finally {
      this.#waitUntilSettled = true
      this.#waitUntilGateResolve!()
    }
  }

  /**
   * A helper to see top level properties on the context object
   */
  /* c8 ignore next 3 */
  inspect() {
    return inspect(this, false, 1, true)
  }
}
