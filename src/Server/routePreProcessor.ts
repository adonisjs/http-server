/*
 * @adonisjs/server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../contracts.ts" />

import { Middleware } from 'co-compose'
import { Exception } from '@poppinss/utils'
import {
  RouteNode,
  HttpContextContract,
  MiddlewareStoreContract,
} from '@poppinss/http-server/contracts'

import { finalMiddlewareHandler } from './finalMiddlewareHandler'
import { finalRouteHandler } from './finalRouteHandler'
import { exceptionCodes } from '../helpers'

/**
 * Executes the route middleware. This method is only invoked when route
 * has one or more middleware.
 */
async function middlewareHandler<Context extends HttpContextContract> (ctx: Context) {
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
export function routePreProcessor<Context> (
  route: RouteNode<Context>,
  middlewareStore: MiddlewareStoreContract<Context>,
) {
  middlewareStore.preCompileMiddleware(route)

  /**
   * Resolve route handler before hand to keep HTTP layer performant
   */
  if (typeof (route.handler) === 'string') {
    let handler = route.handler

    /**
     * 1. Do not prepend namespace, if `namespace` starts with `/`.
     * 2. Else if `namespace` exists, then prepend the namespace
     */
    if (route.handler.startsWith('/')) {
      handler = route.handler.substr(1)
    } else if (route.meta.namespace) {
      handler = `${route.meta.namespace.replace(/\/$/, '')}/${route.handler}`
    }

    /**
     * Split the controller and method. Raise error if `method` is missing
     */
    const [ namespace, method ] = handler.split('.')
    if (!method) {
      throw new Exception(
        `Missing controller method on \`${route.pattern}\` route`,
        500,
        exceptionCodes.E_INVALID_ROUTE_NAMESPACE,
      )
    }

    /**
     * Unlike middleware, we do not prefetch controller from the IoC container
     * since controllers in an app can grow to a huge number and lazy loading
     * them improves the performance overall.
     *
     * Sometime later, we can introduce `hot cache` in IoC container, which
     * avoids lookup cost within the IoC container.
     */
    route.meta.resolvedHandler = {
      type: 'iocReference',
      namespace: namespace,
      method,
    }
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
