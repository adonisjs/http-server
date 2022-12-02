/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import string from '@poppinss/utils/string'
import Middleware from '@poppinss/middleware'
import type Encryption from '@adonisjs/encryption'
import type { ContainerResolver } from '@adonisjs/fold'
import type { Application } from '@adonisjs/application'
import type { IncomingMessage, ServerResponse } from 'node:http'

import type { LazyImport } from '../types/base.js'
import type { RequestConfig } from '../types/request.js'
import type { ResponseConfig } from '../types/response.js'
import type { ErrorHandlerAsAClass, ServerErrorHandler } from '../types/server.js'
import type { MiddlewareAsClass, ParsedGlobalMiddleware } from '../types/middleware.js'

import debug from '../debug.js'
import { Request } from '../request.js'
import { Response } from '../response.js'
import { Router } from '../router/main.js'
import { shouldUseReturnValue } from '../helpers.js'
import { HttpContext } from '../http_context/main.js'
import { MiddlewareStore } from '../middleware/store.js'
import { finalHandler } from './factories/final_handler.js'
import { writeResponse } from './factories/write_response.js'
import { asyncLocalStorage } from '../http_context/local_storage.js'
import { middlewareHandler } from './factories/middleware_handler.js'

/**
 * The HTTP server implementation to handle incoming requests and respond using the
 * registered routes.
 */
export class Server<NamedMiddleware extends Record<string, LazyImport<MiddlewareAsClass>> = any> {
  /**
   * Registered error handler (if any)
   */
  #errorHandler?: LazyImport<ErrorHandlerAsAClass>

  /**
   * Resolved error handler is an instance of the lazily imported error
   * handler class.
   */
  #resolvedErrorHandler: ServerErrorHandler = {
    handle(error, ctx) {
      ctx.response.status(error.status || 500).send(error.message || 'Internal server error')
    },
  }

  /**
   * The application instance to be shared with the router
   */
  #app: Application

  /**
   * The encryption instance to be shared with the router
   */
  #encryption: Encryption

  /**
   * Server config
   */
  #config: RequestConfig & ResponseConfig

  /**
   * Server middleware stack runs on every incoming HTTP request
   */
  #serverMiddlewareStack?: Middleware<ParsedGlobalMiddleware>

  /**
   * The router instance. Router exists after middleware have been
   * registered with the server.
   */
  router?: Router

  /**
   * Know if async local storage is enabled or not.
   */
  get usingAsyncLocalStorage() {
    return asyncLocalStorage.isEnabled
  }

  constructor(app: Application, encryption: Encryption, config: RequestConfig & ResponseConfig) {
    this.#app = app
    this.#encryption = encryption
    this.#config = config
    this.#preProcessCookieMaxAge()
    this.#createAsyncLocalStore()

    debug('server config: %O', this.#config)
  }

  /**
   * Pre-processing cookie maxAge property to avoid re-parsing on
   * every request
   */
  #preProcessCookieMaxAge() {
    /*
     * Pre process config to convert max age string to seconds.
     */
    if (this.#config.cookie.maxAge && typeof this.#config.cookie.maxAge === 'string') {
      this.#config.cookie.maxAge = string.seconds.parse(this.#config.cookie.maxAge)
    }
  }

  /**
   * Create async local storage store when enabled
   */
  #createAsyncLocalStore() {
    if (this.#config.useAsyncLocalStorage) {
      debug('creating http context async local storage')
      asyncLocalStorage.create()
    } else {
      asyncLocalStorage.destroy()
    }
  }

  /**
   * Creates an instance of the router
   */
  #createRouter(middlewareStore: MiddlewareStore<NamedMiddleware>) {
    this.router = new Router(this.#app, this.#encryption, middlewareStore)
  }

  /**
   * Creates an instance of the server middleware stack
   */
  #createServerMiddlewareStack(middlewareStore: MiddlewareStore<any>) {
    this.#serverMiddlewareStack = new Middleware()
    middlewareStore.list().forEach((middleware) => this.#serverMiddlewareStack!.add(middleware))
    this.#serverMiddlewareStack.freeze()
  }

  /**
   * Creates an instance of the HTTP context for the current
   * request
   */
  #createContext(req: IncomingMessage, res: ServerResponse) {
    const request = new Request(req, res, this.#encryption, this.#config)
    const response = new Response(req, res, this.#encryption, this.#config, this.router!)
    return new HttpContext(request, response, this.#app.logger.child({}))
  }

  /**
   * Define the middleware to use on the server and the router
   */
  use(
    serverMiddleware: LazyImport<MiddlewareAsClass>[],
    routerMiddleware: LazyImport<MiddlewareAsClass>[],
    namedMiddleware: NamedMiddleware
  ) {
    this.#createRouter(new MiddlewareStore(routerMiddleware, namedMiddleware))
    this.#createServerMiddlewareStack(new MiddlewareStore(serverMiddleware))

    return this
  }

  /**
   * Register a custom error handler for HTTP requests.
   * All errors will be reported to this method
   */
  errorHandler(handler: LazyImport<ErrorHandlerAsAClass>): this {
    this.#errorHandler = handler
    return this
  }

  /**
   * Boot the server. Calling this method performs the following actions.
   *
   * - Register routes with the store.
   * - Resolve and construct the error handler.
   */
  async boot() {
    debug('booting HTTP server')
    this.router!.commit()

    if (this.#errorHandler) {
      if (debug.enabled) {
        debug('using custom error handler "%s"', this.#errorHandler)
      }

      const moduleExports = await this.#errorHandler()
      this.#resolvedErrorHandler = await this.#app.container.make(moduleExports.default)
    }
  }

  /**
   * Handles the HTTP request
   */
  #handleRequest(ctx: HttpContext, resolver: ContainerResolver) {
    return this.#serverMiddlewareStack!.runner()
      .finalHandler(finalHandler(this.router!, resolver, ctx))
      .run(middlewareHandler(resolver, ctx))
      .then((value) => {
        if (shouldUseReturnValue(value, ctx)) {
          ctx.response.send(value)
        }
      })
      .catch((error) => this.#resolvedErrorHandler.handle(error, ctx))
      .finally(writeResponse(ctx))
  }

  /**
   * Handle request
   */
  handle(req: IncomingMessage, res: ServerResponse) {
    const ctx = this.#createContext(req, res)
    const resolver = this.#app.container.createResolver()

    if (this.usingAsyncLocalStorage) {
      return asyncLocalStorage.storage!.run(ctx, () => this.#handleRequest(ctx, resolver))
    }

    return this.#handleRequest(ctx, resolver)
  }
}
