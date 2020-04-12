/**
 * @module @adonisjs/http-server
 */

/*
* @adonisjs/http-server
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

/// <reference path="../../adonis-typings/index.ts" />

import ms from 'ms'
import { IocContract } from '@adonisjs/fold'
import { Server as HttpsServer } from 'https'
import { LoggerContract } from '@ioc:Adonis/Core/Logger'
import { EncryptionContract } from '@ioc:Adonis/Core/Encryption'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { IncomingMessage, ServerResponse, Server as HttpServer } from 'http'
import { ProfilerContract, ProfilerRowContract } from '@ioc:Adonis/Core/Profiler'
import { ServerContract, ServerConfig, ErrorHandler } from '@ioc:Adonis/Core/Server'

import { Hooks } from './Hooks'
import { Router } from '../Router'
import { Request } from '../Request'
import { Response } from '../Response'
import { PreCompiler } from './PreCompiler'
import { HttpContext } from '../HttpContext'
import { RequestHandler } from './RequestHandler'
import { MiddlewareStore } from '../MiddlewareStore'
import { ExceptionManager } from '../ExceptionManager'

/**
 * Server class handles the HTTP requests by using all Adonis micro modules.
 */
export class Server implements ServerContract {
  /**
   * The server itself doesn't create the http server instance. However, the consumer
   * of this class can create one and set the instance for further reference. This
   * is what ignitor does.
   */
  public instance?: HttpServer | HttpsServer

  /**
   * The middleware store to register global and named middleware
   */
  public middleware = new MiddlewareStore(this.container)

  /**
   * The route to register routes
   */
  public router = new Router(this.encryption, (route) => this.precompiler.compileRoute(route))

  /**
   * Server before/after hooks
   */
  public hooks = new Hooks()

  /**
   * Precompiler to set the finalHandler for the route
   */
  private precompiler = new PreCompiler(this.container, this.middleware)

  /**
   * Exception manager to handle exceptions
   */
  private exception = new ExceptionManager(this.container)

  /**
   * Request handler to handle request after route is found
   */
  private requestHandler = new RequestHandler(this.middleware, this.router)

  constructor (
    private container: IocContract,
    private logger: LoggerContract,
    private profiler: ProfilerContract,
    private encryption: EncryptionContract,
    private httpConfig: ServerConfig,
  ) {
    /**
     * Pre process config to convert max age string to seconds.
     */
    if (httpConfig.cookie.maxAge && typeof (httpConfig.cookie.maxAge) === 'string') {
      httpConfig.cookie.maxAge = ms(httpConfig.cookie.maxAge) / 1000
    }
  }

  /**
   * Handles HTTP request
   */
  private async handleRequest (ctx: HttpContextContract) {
    /**
     * Start with before hooks upfront. If they raise error
     * then execute error handler.
     */
    const shortcircuit = await this.hooks.executeBefore(ctx)
    if (!shortcircuit) {
      await this.requestHandler.handle(ctx)
    }
  }

  /**
   * Returns the profiler row
   */
  private getProfileRow (request: Request) {
    return this.profiler.create('http:request', {
      request_id: request.id(),
      url: request.url(),
      method: request.method(),
    })
  }

  /**
   * Returns the context for the request
   */
  private getContext (request: Request, response: Response, profilerRow: ProfilerRowContract) {
    return new HttpContext(request, response, this.logger.child({
      request_id: request.id(),
      serializers: {},
    }), profilerRow)
  }

  /**
   * Define custom error handler to handler all errors
   * occurred during HTTP request
   */
  public errorHandler (handler: ErrorHandler): this {
    this.exception.registerHandler(handler)
    return this
  }

  /**
   * Optimizes internal handlers, based upon the existence of
   * before handlers and global middleware. This helps in
   * increasing throughput by 10%
   */
  public optimize () {
    this.router.commit()
    this.hooks.commit()
    this.requestHandler.commit()
  }

  /**
   * Handles a given HTTP request. This method can be attached to any HTTP
   * server
   */
  public async handle (req: IncomingMessage, res: ServerResponse): Promise<void> {
    /**
     * Reset accept header when `forceContentNegotiationToJSON = true`
     */
    if (this.httpConfig.forceContentNegotiationToJSON) {
      req.headers['accept'] = 'application/json'
    }

    const request = new Request(req, res, this.encryption, this.httpConfig)
    const response = new Response(req, res, this.encryption, this.httpConfig)

    const requestAction = this.getProfileRow(request)
    const ctx = this.getContext(request, response, requestAction)

    /**
     * Handle request by executing hooks, request middleware stack
     * and route handler
     */
    try {
      await this.handleRequest(ctx)
    } catch (error) {
      await this.exception.handle(error, ctx)
    }

    /**
     * Excute hooks when there are one or more hooks
     */
    try {
      await this.hooks.executeAfter(ctx)
      requestAction.end({ status_code: res.statusCode })
      ctx.response.finish()
    } catch (error) {
      await this.exception.handle(error, ctx)
      requestAction.end({ status_code: res.statusCode, error })
      ctx.response.finish()
    }
  }
}
