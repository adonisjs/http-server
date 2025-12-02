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
   * A helper to see top level properties on the context object
   */
  /* c8 ignore next 3 */
  inspect() {
    return inspect(this, false, 1, true)
  }
}
