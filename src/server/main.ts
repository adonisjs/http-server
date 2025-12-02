/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import onFinished from 'on-finished'
import Middleware from '@poppinss/middleware'
import type { Logger } from '@adonisjs/logger'
import type { LazyImport } from '@poppinss/utils/types'
import type { Encryption } from '@adonisjs/encryption'
import type { Server as HttpsServer } from 'node:https'
import type { Application } from '@adonisjs/application'
import type { EmitterLike } from '@adonisjs/events/types'
import { type ContainerResolver, moduleCaller, moduleImporter } from '@adonisjs/fold'
import type { ServerResponse, IncomingMessage, Server as HttpServer } from 'node:http'
import type { MiddlewareAsClass, ParsedGlobalMiddleware } from '../types/middleware.ts'
import type {
  ServerConfig,
  HttpServerEvents,
  ServerErrorHandler,
  ErrorHandlerAsAClass,
  TestingMiddlewarePipeline,
} from '../types/server.ts'

import { Qs } from '../qs.ts'
import debug from '../debug.ts'
import { HttpRequest } from '../request.ts'
import { Router } from '../router/main.ts'
import { HttpResponse } from '../response.ts'
import { HttpContext } from '../http_context/main.ts'
import { routeFinder } from './factories/route_finder.ts'
import { writeResponse } from './factories/write_response.ts'
import { asyncLocalStorage } from '../http_context/local_storage.ts'
import { middlewareHandler } from './factories/middleware_handler.ts'
import { httpRequest, httpExceptionHandler } from '../tracing_channels.ts'

/**
 * The Server class provides the core HTTP server implementation for AdonisJS.
 *
 * It handles incoming HTTP requests by processing them through middleware pipelines,
 * routing them to appropriate handlers, and managing response generation. The server
 * supports custom error handling, middleware registration, and various Node.js HTTP
 * server configurations.
 *
 * @example
 * ```ts
 * const server = new Server(app, encryption, emitter, logger, config)
 * server.use([AuthMiddleware, CorsMiddleware])
 * server.errorHandler(() => import('./error_handler.ts'))
 * await server.boot()
 *
 * http.createServer(server.handle.bind(server))
 * ```
 */
export class Server {
  /**
   * Flag indicating whether the server has been booted and initialized
   */
  #booted: boolean = false

  /**
   * Built-in fallback error handler used when no custom handler is registered
   */
  #defaultErrorHandler: ServerErrorHandler = {
    report() {},
    handle(error, ctx) {
      ctx.response.status(error.status || 500).send(error.message || 'Internal server error')
    },
  }

  /**
   * Logger instance for server-level logging (child loggers are created per request)
   */
  #logger: Logger

  /**
   * Lazy import reference to the custom error handler class
   */
  #errorHandler?: LazyImport<ErrorHandlerAsAClass>

  /**
   * Active error handler instance (either custom or default)
   */
  #resolvedErrorHandler: ServerErrorHandler = this.#defaultErrorHandler

  /**
   * Event emitter for HTTP server lifecycle events
   */
  #emitter: EmitterLike<HttpServerEvents>

  /**
   * AdonisJS application instance providing IoC container and configuration
   */
  #app: Application<any>

  /**
   * Encryption service for secure cookie handling and data encryption
   */
  #encryption: Encryption

  /**
   * Server configuration settings including timeouts, middleware options, etc.
   */
  #config: ServerConfig

  /**
   * Query string parser instance for URL parameter processing
   */
  #qsParser: Qs

  /**
   * Compiled middleware stack that executes on every incoming HTTP request
   */
  #serverMiddlewareStack?: Middleware<ParsedGlobalMiddleware>

  /**
   * Router instance responsible for route registration and matching
   */
  #router: Router

  /**
   * Reference to the underlying Node.js HTTP or HTTPS server instance
   */
  #nodeHttpServer?: HttpServer | HttpsServer

  /**
   * Collection of registered global middleware before compilation
   */
  #middleware: ParsedGlobalMiddleware[] = []

  /**
   * Error responder function that handles exceptions in middleware and routes.
   * Reports errors and delegates handling to the configured error handler.
   */
  #requestErrorResponder: ServerErrorHandler['handle'] = (error, ctx) => {
    this.#resolvedErrorHandler.report(error, ctx)

    return httpExceptionHandler.tracePromise(
      this.#resolvedErrorHandler.handle,
      undefined,
      this.#resolvedErrorHandler,
      error,
      ctx
    )
  }

  /**
   * Indicates whether the server has completed its boot process
   */
  get booted() {
    return this.#booted
  }

  /**
   * Indicates whether async local storage is enabled for request context
   */
  get usingAsyncLocalStorage() {
    return asyncLocalStorage.isEnabled
  }

  /**
   * Creates a new Server instance
   *
   * @param app - AdonisJS application instance
   * @param encryption - Encryption service for secure operations
   * @param emitter - Event emitter for server lifecycle events
   * @param logger - Logger instance for server operations
   * @param config - Server configuration settings
   */
  constructor(
    app: Application<any>,
    encryption: Encryption,
    emitter: EmitterLike<HttpServerEvents>,
    logger: Logger,
    config: ServerConfig
  ) {
    this.#app = app
    this.#emitter = emitter
    this.#config = config
    this.#logger = logger
    this.#encryption = encryption
    this.#qsParser = new Qs(this.#config.qs)
    this.#router = new Router(this.#app, this.#encryption, this.#qsParser)
    this.#createAsyncLocalStore()

    debug('server config: %O', this.#config)
  }

  /**
   * Initializes or destroys async local storage based on configuration
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
   * Compiles registered middleware into a frozen middleware stack for execution
   */
  #createServerMiddlewareStack() {
    this.#serverMiddlewareStack = new Middleware()
    this.#middleware.forEach((middleware) => this.#serverMiddlewareStack!.add(middleware))
    this.#serverMiddlewareStack.freeze()
    this.#middleware = []
  }

  /**
   * Processes an HTTP request through the middleware pipeline and routing
   *
   * @param ctx - HTTP context containing request/response objects
   * @param resolver - Container resolver for dependency injection
   * @returns Promise that resolves when request processing is complete
   */
  #handleRequest(ctx: HttpContext, resolver: ContainerResolver<any>) {
    return this.#serverMiddlewareStack!.runner()
      .errorHandler((error) => this.#requestErrorResponder(error, ctx))
      .finalHandler(routeFinder(this.#router!, resolver, ctx, this.#requestErrorResponder))
      .run(middlewareHandler(resolver, ctx))
      .catch((error) => {
        ctx.logger.fatal({ err: error }, 'Exception raised by error handler')
        return this.#defaultErrorHandler.handle(error, ctx)
      })
      .finally(writeResponse(ctx))
  }

  /**
   * Creates a testing middleware pipeline for unit/integration testing
   *
   * @param middleware - Array of middleware classes to include in pipeline
   * @returns TestingMiddlewarePipeline instance for test execution
   */
  pipeline(middleware: MiddlewareAsClass[]): TestingMiddlewarePipeline {
    const middlewareStack = new Middleware<ParsedGlobalMiddleware>()
    middleware.forEach((one) => {
      middlewareStack.add({
        reference: one,
        ...moduleCaller(one, 'handle').toHandleMethod(),
      })
    })

    middlewareStack.freeze()
    const stackRunner = middlewareStack.runner()

    return {
      finalHandler(handler) {
        stackRunner.finalHandler(handler)
        return this
      },
      errorHandler(handler) {
        stackRunner.errorHandler(handler)
        return this
      },
      run(ctx) {
        return stackRunner.run((handler, next) => {
          return handler.handle(ctx.containerResolver, ctx, next)
        })
      },
    }
  }

  /**
   * Registers global middleware to run on all incoming HTTP requests
   *
   * @param middleware - Array of lazy-imported middleware classes
   * @returns The Server instance for method chaining
   */
  use(middleware: LazyImport<MiddlewareAsClass>[]): this {
    middleware.forEach((one) =>
      this.#middleware.push({
        reference: one,
        ...moduleImporter(one, 'handle').toHandleMethod(),
      })
    )

    return this
  }

  /**
   * Registers a custom error handler for HTTP request processing
   *
   * @param handler - Lazy import of the error handler class
   * @returns The Server instance for method chaining
   */
  errorHandler(handler: LazyImport<ErrorHandlerAsAClass>): this {
    this.#errorHandler = handler
    return this
  }

  /**
   * Initializes the server by compiling middleware, committing routes, and resolving handlers
   *
   * Performs the following operations:
   * - Compiles the middleware stack
   * - Commits registered routes to the router
   * - Resolves and instantiates the custom error handler
   */
  async boot() {
    if (this.#booted) {
      return
    }

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

    this.#booted = true
  }

  /**
   * Configures the underlying Node.js HTTP/HTTPS server with timeout settings
   *
   * @param server - Node.js HTTP or HTTPS server instance
   */
  setNodeServer(server: HttpServer | HttpsServer) {
    server.timeout = this.#config.timeout ?? server.timeout
    server.keepAliveTimeout = this.#config.keepAliveTimeout ?? server.keepAliveTimeout
    server.headersTimeout = this.#config.headersTimeout ?? server.headersTimeout
    server.requestTimeout = this.#config.requestTimeout ?? server.requestTimeout
    this.#nodeHttpServer = server
  }

  /**
   * Gets the underlying Node.js HTTP/HTTPS server instance
   *
   * @returns The configured server instance or undefined if not set
   */
  getNodeServer() {
    return this.#nodeHttpServer
  }

  /**
   * Gets the router instance used for route registration and matching
   *
   * @returns The Router instance
   */
  getRouter(): Router {
    return this.#router
  }

  /**
   * Creates a Request instance from Node.js request/response objects
   *
   * @param req - Node.js IncomingMessage
   * @param res - Node.js ServerResponse
   * @returns New Request instance
   */
  createRequest(req: IncomingMessage, res: ServerResponse) {
    return new HttpRequest(req, res, this.#encryption, this.#config, this.#qsParser)
  }

  /**
   * Creates a Response instance from Node.js request/response objects
   *
   * @param req - Node.js IncomingMessage
   * @param res - Node.js ServerResponse
   * @returns New Response instance
   */
  createResponse(req: IncomingMessage, res: ServerResponse) {
    return new HttpResponse(req, res, this.#encryption, this.#config, this.#router, this.#qsParser)
  }

  /**
   * Creates an HttpContext instance with request-specific logger
   *
   * @param request - Request instance
   * @param response - Response instance
   * @param resolver - Container resolver for dependency injection
   * @returns New HttpContext instance
   */
  createHttpContext(
    request: HttpRequest,
    response: HttpResponse,
    resolver: ContainerResolver<any>
  ) {
    return new HttpContext(
      request,
      response,
      this.#logger.child({ request_id: request.id() }),
      resolver
    )
  }

  /**
   * Gets the list of registered global middleware
   *
   * @returns Array of parsed global middleware
   */
  getMiddlewareList(): ParsedGlobalMiddleware[] {
    return this.#serverMiddlewareStack
      ? Array.from(this.#serverMiddlewareStack.all())
      : [...this.#middleware]
  }

  /**
   * Handles an incoming HTTP request by creating context and processing through pipeline
   *
   * @param req - Node.js IncomingMessage
   * @param res - Node.js ServerResponse
   * @returns Promise that resolves when request processing is complete
   */
  handle(req: IncomingMessage, res: ServerResponse) {
    /**
     * Setup for the "http:request_finished" event
     */
    const hasRequestListener = this.#emitter.hasListeners('http:request_completed')
    const startTime = hasRequestListener ? process.hrtime() : null

    /**
     * Creating essential instances
     */
    const resolver = this.#app.container.createResolver()
    const ctx = this.createHttpContext(
      this.createRequest(req, res),
      this.createResponse(req, res),
      resolver
    )

    /**
     * Emit event when listening for the request_finished event
     */
    if (startTime) {
      onFinished(res, () => {
        this.#emitter.emit('http:request_completed', {
          ctx: ctx,
          duration: process.hrtime(startTime),
        })
      })
    }

    /**
     * Handle request
     */
    if (this.usingAsyncLocalStorage) {
      return asyncLocalStorage.storage!.run(ctx, () =>
        httpRequest.tracePromise(
          this.#handleRequest,
          httpRequest.hasSubscribers ? { ctx } : undefined,
          this,
          ctx,
          resolver
        )
      )
    }

    return httpRequest.tracePromise(
      this.#handleRequest,
      httpRequest.hasSubscribers ? { ctx } : undefined,
      this,
      ctx,
      resolver
    )
  }
}
