/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { ContainerResolver } from '@adonisjs/fold'
import type { StoreRouteNode } from '../types/route.js'
import type { HttpContext } from '../http_context/main.js'
import type { ServerErrorHandler } from '../types/server.js'
import { useReturnValue } from './factories/use_return_value.js'

/**
 * Executor to execute the route middleware pipeline the route
 * handler
 */
export function execute(
  route: StoreRouteNode,
  resolver: ContainerResolver<any>,
  ctx: HttpContext,
  errorResponder: ServerErrorHandler['handle']
) {
  return route.middleware
    .runner()
    .errorHandler((error) => errorResponder(error, ctx))
    .finalHandler(async () => {
      if (typeof route.handler === 'function') {
        return Promise.resolve(route.handler(ctx)).then(useReturnValue(ctx))
      }

      return route.handler.handle(resolver, ctx).then(useReturnValue(ctx))
    })
    .run(async (middleware, next) => {
      if (typeof middleware === 'function') {
        return middleware(ctx, next)
      }

      return middleware.handle(resolver, ctx, next, middleware.args)
    })
}
