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

/// <reference path="../../adonis-typings/index.ts" />

import { Middleware } from 'co-compose'
import { parseIocReference } from '@poppinss/utils'
import {
  RouteNode,
} from '@ioc:Adonis/Core/Route'

import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { MiddlewareStoreContract } from '@ioc:Adonis/Core/Middleware'

import { finalMiddlewareHandler } from './finalMiddlewareHandler'
import { finalRouteHandler } from './finalRouteHandler'

/**
 * Executes the route middleware. This method is only invoked when route
 * has one or more middleware.
 */
async function middlewareHandler (ctx: HttpContextContract) {
  await new Middleware()
    .register(ctx.route!.meta.resolvedMiddleware)
    .runner()
    .finalHandler(finalRouteHandler, [ctx])
    .resolve(finalMiddlewareHandler)
    .run([ctx])
}

/**
 * Hooks into route registration lifecycle and attaches finalHandler to
 * execute the route middleware and final handler.
 *
 * We pre-compile routes and final handler to a single function, which improves
 * the performance by reducing the overhead of processing middleware on each
 * request
 */
export function routePreProcessor (
  route: RouteNode,
  middlewareStore: MiddlewareStoreContract,
) {
  middlewareStore.preCompileMiddleware(route)

  /**
   * Resolve route handler before hand to keep HTTP layer performant
   */
  if (typeof (route.handler) === 'string') {
    /**
     * Unlike middleware, we do not prefetch controller from the IoC container
     * since controllers in an app can grow to a huge number and lazy loading
     * them improves the performance overall.
     *
     * Sometime later, we can introduce `hot cache` in IoC container, which
     * avoids lookup cost within the IoC container.
     */
    route.meta.resolvedHandler = parseIocReference(route.handler, route.meta.namespace)
  } else {
    route.meta.resolvedHandler = {
      type: 'function',
      handler: route.handler,
    }
  }

  /**
   * Attach middleware handler when route has 1 or more middleware, otherwise
   * skip the middleware layer and use final handler
   */
  if (route.meta.resolvedMiddleware.length) {
    route.meta.finalHandler = middlewareHandler
  } else {
    route.meta.finalHandler = finalRouteHandler
  }
}
