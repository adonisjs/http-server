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

import { Socket } from 'net'
import proxyAddr from 'proxy-addr'
import { RouteNode } from '@ioc:Adonis/Core/Route'
import { IncomingMessage, ServerResponse } from 'http'
import { LoggerContract } from '@ioc:Adonis/Core/Logger'
import { RequestContract } from '@ioc:Adonis/Core/Request'
import { ResponseContract } from '@ioc:Adonis/Core/Response'
import { ServerConfigContract } from '@ioc:Adonis/Core/Server'
import { ProfilerRowContract } from '@ioc:Adonis/Core/Profiler'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { makeUrl } from '../helpers'
import { Request } from '../Request'
import { Response } from '../Response'

/**
 * Http context is passed to all route handlers, middleware,
 * error handler and server hooks.
 */
export class HttpContext implements HttpContextContract {
  public params: any = {}
  public subdomains: any = {}
  public route?: RouteNode

  constructor (
    public request: RequestContract,
    public response: ResponseContract,
    public logger: LoggerContract,
    public profiler: ProfilerRowContract,
  ) {}

  /**
   * Creates a new fake context instance for a given route.
   */
  public static create (
    routePattern: string,
    routeParams: any,
    logger: LoggerContract,
    profiler: ProfilerRowContract,
    req?: IncomingMessage,
    res?: ServerResponse,
    serverConfig?: ServerConfigContract,
  ) {
    req = req || new IncomingMessage(new Socket())
    res = res || new ServerResponse(req)

    /**
     * Composing server config
     */
    serverConfig = Object.assign({
      secret: Math.random().toFixed(36).substring(2, 38),
      subdomainOffset: 2,
      allowMethodSpoofing: true,
      etag: false,
      generateRequestId: false,
      cookie: {},
      jsonpCallbackName: 'callback',
      trustProxy: proxyAddr.compile('loopback'),
    }, serverConfig || {})

    /**
     * Creating the url from the router pattern and params. Only
     * when actual URL isn't defined.
     */
    req.url = req.url || makeUrl(routePattern, { params: routeParams, qs: {} })

    /**
     * Creating new request instance
     */
    const request = new Request(req, res, {
      allowMethodSpoofing: serverConfig.allowMethodSpoofing,
      subdomainOffset: serverConfig.subdomainOffset,
      trustProxy: serverConfig.trustProxy,
      generateRequestId: serverConfig.generateRequestId,
    })

    /**
     * Creating new response instance
     */
    const response = new Response(req, res, {
      etag: serverConfig.etag,
      cookie: serverConfig.cookie,
      jsonpCallbackName: serverConfig.jsonpCallbackName,
    })

    /**
     * Creating new ctx instance
     */
    const ctx = new HttpContext(request, response, logger, profiler)

    /**
     * Attaching route to the ctx
     */
    ctx.route = {
      pattern: routePattern,
      middleware: [],
      handler: async () => 'handled',
      meta: {},
    }

    /**
     * Attaching params to the ctx
     */
    ctx.params = routeParams

    return ctx
  }
}
