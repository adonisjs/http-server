/**
 * @adonisjs/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../../adonis-typings/index.ts" />

import { Socket } from 'net'
import { inspect } from 'util'
import { Macroable } from 'macroable'
import { RouteNode } from '@ioc:Adonis/Core/Route'
import { IncomingMessage, ServerResponse } from 'http'
import { LoggerContract } from '@ioc:Adonis/Core/Logger'
import { RequestContract } from '@ioc:Adonis/Core/Request'
import { ResponseContract } from '@ioc:Adonis/Core/Response'
import { ProfilerRowContract } from '@ioc:Adonis/Core/Profiler'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { Request } from '../Request'
import { Response } from '../Response'
import { processPattern } from '../helpers'
import { adonisLocalStorage, asyncHttpContextEnabled } from '../AsyncHttpContext'
import { Exception } from '@poppinss/utils'

/**
 * Http context is passed to all route handlers, middleware,
 * error handler and server hooks.
 */
export class HttpContext extends Macroable implements HttpContextContract {
  /**
   * Set inside the provider
   */
  public static app: ApplicationContract

  public static get asyncHttpContextEnabled() {
    return asyncHttpContextEnabled
  }

  public static get(): HttpContextContract | null {
    const store = adonisLocalStorage.getStore()
    return store !== undefined ? store.getContext() : null
  }

  public static getOrFail() {
    const store = adonisLocalStorage.getStore()
    if (store !== undefined) {
      return store.getContext()
    }
    if (asyncHttpContextEnabled) {
      throw new Exception('async HTTP context accessed outside of a request context')
    } else {
      throw new Exception('async HTTP context is disabled')
    }
  }

  /**
   * A unique key for the current route
   */
  public routeKey: string

  /**
   * Route params
   */
  public params: Record<string, any> = {}

  /**
   * Route subdomains
   */
  public subdomains: Record<string, any> = {}

  /**
   * Reference to the current route. Not available inside
   * server hooks
   */
  public route?: RouteNode

  /**
   * Required by macroable
   */
  protected static macros = {}
  protected static getters = {}

  constructor(
    public request: RequestContract,
    public response: ResponseContract,
    public logger: LoggerContract,
    public profiler: ProfilerRowContract
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
  public inspect() {
    return inspect(this, false, 1, true)
  }

  /**
   * Creates a new fake context instance for a given route. The method is
   * meant to be used inside an AdonisJS application since it relies
   * directly on the IoC container.
   */
  public static create(
    routePattern: string,
    routeParams: Record<string, any>,
    req?: IncomingMessage,
    res?: ServerResponse
  ) {
    const Router = HttpContext.app.container.resolveBinding('Adonis/Core/Route')
    const Encryption = HttpContext.app.container.resolveBinding('Adonis/Core/Encryption')
    const serverConfig = HttpContext.app.container
      .resolveBinding('Adonis/Core/Config')
      .get('app.http', {})

    req = req || new IncomingMessage(new Socket())
    res = res || new ServerResponse(req)

    /*
     * Creating the url from the router pattern and params. Only
     * when actual URL isn't defined.
     */
    req.url = req.url || processPattern(routePattern, routeParams)

    /*
     * Creating new request instance
     */
    const request = new Request(req, res, Encryption, {
      allowMethodSpoofing: serverConfig.allowMethodSpoofing,
      subdomainOffset: serverConfig.subdomainOffset,
      trustProxy: serverConfig.trustProxy,
      generateRequestId: serverConfig.generateRequestId,
    })

    /*
     * Creating new response instance
     */
    const response = new Response(
      req,
      res,
      Encryption,
      {
        etag: serverConfig.etag,
        cookie: serverConfig.cookie,
        jsonpCallbackName: serverConfig.jsonpCallbackName,
      },
      Router
    )

    /*
     * Creating new ctx instance
     */
    const ctx = new HttpContext(
      request,
      response,
      this.app.logger.child({}),
      this.app.profiler.create('http:context')
    )

    /*
     * Attaching route to the ctx
     */
    ctx.route = {
      pattern: routePattern,
      middleware: [],
      handler: async () => 'handled',
      meta: {},
    }

    /*
     * Defining route key
     */
    ctx.routeKey = `${request.method()}-${ctx.route.pattern}`

    /*
     * Attaching params to the ctx
     */
    ctx.params = routeParams

    /**
     * Set params on the request
     */
    ctx.request.updateParams(routeParams)

    return ctx
  }
}
