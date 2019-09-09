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

import { IocContract } from '@adonisjs/fold'
import { Server as HttpsServer } from 'https'
import { LoggerContract } from '@ioc:Adonis/Core/Logger'
import { EncryptionContract } from '@ioc:Adonis/Core/Encryption'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { IncomingMessage, ServerResponse, Server as HttpServer } from 'http'
import { ProfilerContract, ProfilerRowContract } from '@ioc:Adonis/Core/Profiler'
import { ServerContract, ServerConfigContract, ErrorHandlerNode } from '@ioc:Adonis/Core/Server'

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
  public middleware = new MiddlewareStore(this._container)

  /**
   * The route to register routes
   */
  public router = new Router(this._encryption, (route) => this._precompiler.compileRoute(route))

  /**
   * Server before/after hooks
   */
  public hooks = new Hooks()

  /**
   * Precompiler to set the finalHandler for the route
   */
  private _precompiler = new PreCompiler(this._container, this.middleware)

  /**
   * Exception manager to handle exceptions
   */
  private _exception = new ExceptionManager(this._container)

  /**
   * Request handler to handle request after route is found
   */
  private _requestHandler = new RequestHandler(this.middleware, this.router)

  constructor (
    private _container: IocContract,
    private _logger: LoggerContract,
    private _profiler: ProfilerContract,
    private _encryption: EncryptionContract,
    private _httpConfig: ServerConfigContract,
  ) {
  }

  /**
   * Handles HTTP request
   */
  private async _handleRequest (ctx: HttpContextContract) {
    /**
     * Start with before hooks upfront. If they raise error
     * then execute error handler.
     */
    const shortcircuit = await this.hooks.executeBefore(ctx)
    if (!shortcircuit) {
      await this._requestHandler.handle(ctx)
    }
  }

  /**
   * Returns the profiler row
   */
  private _getProfileRow (request: Request) {
    return this._profiler.create('http:request', {
      request_id: request.id(),
      url: request.url(),
      method: request.method(),
    })
  }

  /**
   * Returns the context for the request
   */
  private _getContext (request: Request, response: Response, profilerRow: ProfilerRowContract) {
    return new HttpContext(request, response, this._logger.child({
      request_id: request.id(),
      serializers: {},
    }), profilerRow)
  }

  /**
   * Define custom error handler to handler all errors
   * occurred during HTTP request
   */
  public errorHandler (handler: ErrorHandlerNode): this {
    this._exception.registerHandler(handler)
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
    this._requestHandler.commit()
  }

  /**
   * Handles a given HTTP request. This method can be attached to any HTTP
   * server
   */
  public async handle (req: IncomingMessage, res: ServerResponse): Promise<void> {
    const request = new Request(req, res, this._encryption, this._httpConfig)
    const response = new Response(req, res, this._httpConfig)

    const requestAction = this._getProfileRow(request)
    const ctx = this._getContext(request, response, requestAction)

    /**
     * Handle request by executing hooks, request middleware stack
     * and route handler
     */
    try {
      await this._handleRequest(ctx)
    } catch (error) {
      await this._exception.handle(error, ctx)
    }

    /**
     * Excute hooks when there are one or more hooks
     */
    try {
      await this.hooks.executeAfter(ctx)
    } catch (error) {
      await this._exception.handle(error, ctx)
    }

    requestAction.end({ status_code: res.statusCode })
    ctx.response.finish()
  }
}
