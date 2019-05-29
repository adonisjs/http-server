/**
 * @module @poppinss/http-server
 */

/*
* @poppinss/http-server
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { Socket } from 'net'
import { IncomingMessage, ServerResponse } from 'http'
import { RequestContract, Request } from '@poppinss/request'
import { LoggerContract, Logger } from '@poppinss/logger'
import { ResponseContract, Response } from '@poppinss/response'
import { RouteNode, HttpContextContract, ServerConfigContract } from '../contracts'
import { makeUrl, getServerConfig } from '../helpers'

/**
 * Http context is passed to all route handlers, middleware,
 * error handler and server hooks.
 */
export class HttpContext implements HttpContextContract {
  public params?: any
  public subdomains?: any
  public route?: RouteNode<this>

  constructor (
    public request: RequestContract,
    public response: ResponseContract,
    public logger: LoggerContract,
  ) {}

  /**
   * Creates a new fake context instance for a given route.
   */
  public static create (
    routePattern: string,
    routeParams: any,
    req?: IncomingMessage,
    res?: ServerResponse,
    serverConfig?: ServerConfigContract,
  ) {
    req = req || new IncomingMessage(new Socket())
    res = res || new ServerResponse(req)

    /**
     * Composing server config
     */
    serverConfig = getServerConfig(serverConfig || {})

    /**
     * Creating the url from the router pattern and params. Only
     * when actual URL isn't defined.
     */
    req.url = req.url || makeUrl(routePattern, { params: routeParams })

    /**
     * Creating new request instance
     */
    const request = new Request(req, res, {
      allowMethodSpoofing: serverConfig.allowMethodSpoofing,
      subdomainOffset: serverConfig.subdomainOffset,
      trustProxy: serverConfig.trustProxy,
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
    const ctx = new HttpContext(request, response, new Logger({
      name: 'adonis',
      enabled: true,
      level: 'trace',
    }))

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
