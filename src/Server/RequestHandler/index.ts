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

/// <reference path="../../../adonis-typings/index.ts" />

import { Middleware } from 'co-compose'
import { MiddlewareStoreContract } from '@ioc:Adonis/Core/Middleware'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { RouterContract } from '@ioc:Adonis/Core/Route'

/**
 * Handles the request by invoking it's middleware chain, along with the
 * route finalHandler
 */
export class RequestHandler {
  private _globalMiddleware: Middleware
  constructor (
    private _middlewareStore: MiddlewareStoreContract,
    private _router: RouterContract,
  ) {}

  /**
   * Executes the middleware chain, followed by the route handler.
   */
  private async _invokeHandler (ctx: HttpContextContract) {
    await this
      ._globalMiddleware
      .runner()
      .resolve(this._middlewareStore.invokeMiddleware.bind(this._middlewareStore))
      .finalHandler(ctx.route!.meta.finalHandler, [ctx])
      .run([ctx])
  }

  /**
   * Finds the route for the request
   */
  private _findRoute (ctx: HttpContextContract) {
    const url = ctx.request.url()
    const method = ctx.request.method()
    const hostname = ctx.request.hostname()

    /**
     * Profiling `route.match` method
     */
    const matchRoute = ctx.profiler.profile('http:route:match')
    const route = this._router.match(url, method, hostname || undefined)
    matchRoute.end()

    /**
     * Raise error when route is missing
     */
    ctx.response.abortIf(!route, `Cannot ${method}:${url}`, 404)

    /**
     * Attach `params`, `subdomains` and `route` when route is found. This
     * information only exists on a given route
     */
    ctx.params = route!.params
    ctx.subdomains = route!.subdomains
    ctx.route = route!.route
  }

  /**
   * Handles the request and invokes required middleware/handlers
   */
  public async handle (ctx: HttpContextContract) {
    this._findRoute(ctx)
    await this._invokeHandler(ctx)
  }

  /**
   * Computing certain methods to optimize for runtime performance
   */
  public commit () {
    const middleware = this._middlewareStore.get()
    if (middleware.length) {
      this._globalMiddleware = new Middleware().register(middleware)
    } else {
      this._invokeHandler = async (ctx) => ctx.route!.meta.finalHandler(ctx)
    }
  }
}
