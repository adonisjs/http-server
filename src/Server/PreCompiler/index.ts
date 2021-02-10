/**
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
import { RouteNode } from '@ioc:Adonis/Core/Route'
import { Exception } from '@poppinss/utils'
import { interpolate } from '@poppinss/utils/build/helpers'
import { IocContract, IocResolverContract } from '@adonisjs/fold'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { MiddlewareStoreContract, ResolvedMiddlewareHandler } from '@ioc:Adonis/Core/Middleware'

import { useReturnValue } from '../../helpers'
import { E_MISSING_NAMED_MIDDLEWARE } from '../../../exceptions.json'

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
  private runRouteHandler = async (ctx: HttpContextContract) => {
    const routeHandler = ctx.route!.meta.resolvedHandler!

    /*
     * Passing a child to the route handler, so that all internal
     * actions can have their own child row
     */
    let returnValue: any

    if (routeHandler.type === 'function') {
      returnValue = await routeHandler.handler(ctx)
    } else {
      returnValue = await this.resolver.call(routeHandler, undefined, [ctx])
    }

    if (useReturnValue(returnValue, ctx)) {
      ctx.response.send(returnValue)
    }
  }

  /**
   * Method to execute middleware using the middleware store
   */
  private executeMiddleware = (
    middleware: ResolvedMiddlewareHandler,
    params: [HttpContextContract, () => Promise<void>]
  ) => {
    return this.middlewareStore.invokeMiddleware(middleware, params)
  }

  /**
   * This function is used by reference to execute the route middleware + route handler
   */
  private runRouteMiddleware = (ctx: HttpContextContract) => {
    return new Middleware()
      .register(ctx.route!.meta.resolvedMiddleware!)
      .runner()
      .executor(this.executeMiddleware)
      .finalHandler(this.runRouteHandler, [ctx])
      .run([ctx])
  }

  /**
   * The resolver used to resolve the controllers from IoC container
   */
  private resolver: IocResolverContract<any>

  constructor(container: IocContract, private middlewareStore: MiddlewareStoreContract) {
    this.resolver = container.getResolver(undefined, 'httpControllers', 'App/Controllers/Http')
  }

  /**
   * Pre-compiling the handler to boost the runtime performance
   */
  private compileHandler(route: RouteNode) {
    if (typeof route.handler === 'string') {
      route.meta.resolvedHandler = this.resolver.resolve(route.handler, route.meta.namespace)
    } else {
      route.meta.resolvedHandler = { type: 'function', handler: route.handler }
    }
  }

  /**
   * Pre-compile the route middleware to boost runtime performance
   */
  private compileMiddleware(route: RouteNode) {
    route.meta.resolvedMiddleware = route.middleware.map((item) => {
      if (typeof item === 'function') {
        return { type: 'function', value: item, args: [] }
      }

      /*
       * Extract middleware name and args from the string
       */
      const [{ name, args }] = haye.fromPipe(item).toArray()

      /*
       * Get resolved node for the given name and raise exception when that
       * name is missing
       */
      const resolvedMiddleware = this.middlewareStore.getNamed(name)
      if (!resolvedMiddleware) {
        const error = new Exception(
          interpolate(E_MISSING_NAMED_MIDDLEWARE.message, { name }),
          E_MISSING_NAMED_MIDDLEWARE.status,
          E_MISSING_NAMED_MIDDLEWARE.code
        )
        error.help = E_MISSING_NAMED_MIDDLEWARE.help.join('\n')
        throw error
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
  private setFinalHandler(route: RouteNode) {
    if (route.meta.resolvedMiddleware && route.meta.resolvedMiddleware.length) {
      route.meta.finalHandler = this.runRouteMiddleware
    } else {
      route.meta.finalHandler = this.runRouteHandler
    }
  }

  /**
   * Pre-compile route handler and it's middleware to boost runtime performance. Since
   * most of this work is repetitive, we pre-compile and avoid doing it on every
   * request
   */
  public compileRoute(route: RouteNode) {
    this.compileHandler(route)
    this.compileMiddleware(route)
    this.setFinalHandler(route)
  }
}
