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

/**
 * Executor to execute the route middleware pipeline the route
 * handler
 */
export function execute(route: StoreRouteNode, resolver: ContainerResolver, ctx: HttpContext) {
  return route.middleware
    .runner()
    .finalHandler(() => {
      if (typeof route.handler === 'function') {
        return route.handler(ctx)
      }

      return route.handler.handle(resolver, [ctx])
    })
    .run((one, next) => {
      if (typeof one === 'function') {
        return one(ctx, next)
      }

      return one.handle(resolver, [ctx, next, one.args])
    })
}
