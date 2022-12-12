/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Middleware from '@poppinss/middleware'
import type { Encryption } from '@adonisjs/encryption'
import type { Server as HttpsServer } from 'node:https'
import type { Application } from '@adonisjs/application'
import { ContainerResolver, moduleImporter } from '@adonisjs/fold'
import type { ServerResponse, IncomingMessage, Server as HttpServer } from 'node:http'

import type { LazyImport } from '../types/base.js'
import type { MiddlewareAsClass, ParsedGlobalMiddleware } from '../types/middleware.js'
import type { ErrorHandlerAsAClass, ServerConfig, ServerErrorHandler } from '../types/server.js'

import { Qs } from '../qs.js'
import debug from '../debug.js'
import { Request } from '../request.js'
import { Response } from '../response.js'
import { Router } from '../router/main.js'
import { HttpContext } from '../http_context/main.js'
import { finalHandler } from './factories/final_handler.js'
import { writeResponse } from './factories/write_response.js'
import { useReturnValue } from './factories/use_return_value.js'
import { asyncLocalStorage } from '../http_context/local_storage.js'
import { middlewareHandler } from './factories/middleware_handler.js'

/**
 * The HTTP server implementation to handle incoming requests and respond using the
 * registered routes.
 */
export class Server {
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
  #app: Application<any, any>

  /**
   * The encryption instance to be shared with the router
   */
  #encryption: Encryption

  /**
   * Server config
   */
  #config: ServerConfig

  /**
   * Query string parser used by the server
   */
  #qsParser: Qs

  /**
   * Server middleware stack runs on every incoming HTTP request
   */
  #serverMiddlewareStack?: Middleware<ParsedGlobalMiddleware>

  /**
   * Reference to the router used by the server
   */
  #router: Router

  /**
   * Reference to the underlying Node HTTP server in use
   */
  #nodeHttpServer?: HttpServer | HttpsServer

  /**
   * Middleware store to be shared with the routes
   */
  #middleware: ParsedGlobalMiddleware[] = []

  /**
   * Know if async local storage is enabled or not.
   */
  get usingAsyncLocalStorage() {
    return asyncLocalStorage.isEnabled
  }

  constructor(app: Application<any, any>, encryption: Encryption, config: ServerConfig) {
    this.#app = app
    this.#config = config
    this.#encryption = encryption
    this.#qsParser = new Qs(this.#config.qs)
    this.#router = new Router(this.#app, this.#encryption, this.#qsParser)
    this.#createAsyncLocalStore()

    debug('server config: %O', this.#config)
  }

  /**
   * Create async local storage store when enabled
   */
  #createAsyncLocalStore() {
    if (this.#config.useAsyncLocalStorage) {
      debug('creating ALS store for HTTP context')
      asyncLocalStorage.create()
    } else {
      asyncLocalStorage.destroy()
    }
  }

  /**
   * Creates an instance of the server middleware stack
   */
  #createServerMiddlewareStack() {
    this.#serverMiddlewareStack = new Middleware()
    this.#middleware.forEach((middleware) => this.#serverMiddlewareStack!.add(middleware))
    this.#serverMiddlewareStack.freeze()
    this.#middleware = []
  }

  /**
   * Creates an instance of the HTTP context for the current
   * request
   */
  #createContext(req: IncomingMessage, res: ServerResponse, resolver: ContainerResolver<any>) {
    const request = new Request(req, res, this.#encryption, this.#config, this.#qsParser)
    const response = new Response(
      req,
      res,
      this.#encryption,
      this.#config,
      this.#router,
      this.#qsParser
    )

    return new HttpContext(request, response, this.#app.logger.child({}), resolver)
  }

  /**
   * Define an array of middleware to use on all the incoming HTTP request.
   * Calling this method multiple times pushes to the existing list
   * of middleware
   */
  use(middleware: LazyImport<MiddlewareAsClass>[]): this {
    middleware.forEach((one) =>
      this.#middleware.push(moduleImporter(one, 'handle').toHandleMethod())
    )

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

    /**
     * Creates the middleware stack for the server
     */
    this.#createServerMiddlewareStack()

    /**
     * Commit routes
     */
    this.#router.commit()

    /**
     * Register custom error handler
     */
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
  #handleRequest(ctx: HttpContext, resolver: ContainerResolver<any>) {
    return this.#serverMiddlewareStack!.runner()
      .finalHandler(finalHandler(this.#router!, resolver, ctx))
      .run(middlewareHandler(resolver, ctx))
      .then(useReturnValue(ctx))
      .catch((error) => this.#resolvedErrorHandler.handle(error, ctx))
      .finally(writeResponse(ctx))
  }

  /**
   * Set the HTTP server instance used to listen for requests.
   */
  setNodeServer(server: HttpServer | HttpsServer) {
    this.#nodeHttpServer = server
  }

  /**
   * Returns reference to the underlying HTTP server
   * in use
   */
  getNodeServer() {
    return this.#nodeHttpServer
  }

  /**
   * Returns reference to the router instance used
   * by the server.
   */
  getRouter(): Router {
    return this.#router
  }

  /**
   * Handle request
   */
  handle(req: IncomingMessage, res: ServerResponse) {
    const resolver = this.#app.container.createResolver()
    const ctx = this.#createContext(req, res, resolver)

    if (this.usingAsyncLocalStorage) {
      return asyncLocalStorage.storage!.run(ctx, () => this.#handleRequest(ctx, resolver))
    }

    return this.#handleRequest(ctx, resolver)
  }
}
