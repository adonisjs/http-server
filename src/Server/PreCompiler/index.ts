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

import haye from 'haye'
import { Middleware } from 'co-compose'
import { Exception } from '@poppinss/utils'
import { RouteNode } from '@ioc:Adonis/Core/Route'
import { MiddlewareStoreContract } from '@ioc:Adonis/Core/Middleware'
import { IocContract, IocResolverContract } from '@adonisjs/fold'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { useReturnValue } from '../../helpers'

/**
 * Precompiler is used to pre compiler the route handler and middleware. We
 * lookup the middleware and controllers upfront in the IoC container
 * and cache the lookup to boost the runtime performance.
 *
 * Also each route gets a `finalHandler` property, which is used to invoke the
 * route middleware and the route actual handler
 */
export class PreCompiler {
  /**
   * This function is used by reference to execute the route handler
   */
  private _finalRouteHandler = async function finalRouteHandler (ctx: HttpContextContract) {
    let data: any = {}

    let requestProfiler = ctx.profiler

    /**
     * Passing a child to the route handler, so that all internal
     * actions can have their own child row
     */
    ctx.profiler = ctx.profiler.child('http:route:handler', data)

    const routeHandler = ctx.route!.meta.resolvedHandler!
    let returnValue: any

    try {
      if (routeHandler.type === 'function') {
        returnValue = await routeHandler.handler(ctx)
      } else {
        data.controller = routeHandler.namespace
        data.method = routeHandler.method
        returnValue = await this._resolver.call(routeHandler, ctx.route!.meta.namespace, [ctx])
      }

      if (useReturnValue(returnValue, ctx)) {
        ctx.response.send(returnValue)
      }

      ctx.profiler.end()
      ctx.profiler = requestProfiler
    } catch (error) {
      ctx.profiler.end()
      ctx.profiler = requestProfiler
      throw error
    }
  }.bind(this)

  /**
   * This function is used by reference to execute the route middleware + route handler
   */
  private _routeMiddlewareHandler = async function routeMiddlewareHandler (ctx: HttpContextContract) {
    await new Middleware()
      .register(ctx.route!.meta.resolvedMiddleware!)
      .runner()
      .resolve(this._middlewareStore.invokeMiddleware.bind(this._middlewareStore))
      .finalHandler(this._finalRouteHandler, [ctx])
      .run([ctx])
  }.bind(this)

  /**
   * The resolver used to resolve the controllers from IoC container
   */
  private _resolver: IocResolverContract

  constructor (
    container: IocContract,
    private _middlewareStore: MiddlewareStoreContract,
  ) {
    this._resolver = container.getResolver(undefined, 'httpControllers', 'App/Controllers/Http')
  }

  /**
   * Pre-compiling the handler to boost the runtime performance
   */
  private _compileHandler (route: RouteNode) {
    if (typeof (route.handler) === 'string') {
      route.meta.resolvedHandler = this._resolver.resolve(route.handler, route.meta.namespace)
    } else {
      route.meta.resolvedHandler = { type: 'function', handler: route.handler }
    }
  }

  /**
   * Pre-compile the route middleware to boost runtime performance
   */
  private _compileMiddleware (route: RouteNode) {
    route.meta.resolvedMiddleware = route.middleware.map((item) => {
      if (typeof (item) === 'function') {
        return { type: 'function', value: item, args: [] }
      }

      /**
       * Extract middleware name and args from the string
       */
      const [ { name, args } ] = haye.fromPipe(item).toArray()

      /**
       * Get resolved node for the given name and raise exception when that
       * name is missing
       */
      const resolvedMiddleware = this._middlewareStore.getNamed(name)
      if (!resolvedMiddleware) {
        throw new Exception(`Cannot find named middleware ${name}`, 500, 'E_MISSING_NAMED_MIDDLEWARE')
      }

      resolvedMiddleware.args = args
      return resolvedMiddleware
    })
  }

  /**
   * Sets `finalHandler` property on the `route.meta`. This method
   * can be invoked to execute route middleware stack + route
   * controller/closure.
   */
  private _setFinalHandler (route: RouteNode) {
    if (route.meta.resolvedMiddleware && route.meta.resolvedMiddleware.length) {
      route.meta.finalHandler = this._routeMiddlewareHandler
    } else {
      route.meta.finalHandler = this._finalRouteHandler
    }
  }

  /**
   * Pre-compile route handler and it's middleware to boost runtime performance. Since
   * most of this work is repetitive, we pre-compile and avoid doing it on every
   * request
   */
  public compileRoute (route: RouteNode) {
    this._compileHandler(route)
    this._compileMiddleware(route)
    this._setFinalHandler(route)
  }
}
