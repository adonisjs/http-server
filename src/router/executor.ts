/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { ContainerResolver } from '@adonisjs/fold'

import type { RouteJSON } from '../types/route.ts'
import type { HttpContext } from '../http_context/main.ts'
import type { ServerErrorHandler } from '../types/server.ts'
import { useReturnValue } from './factories/use_return_value.ts'
import { httpMiddleware, httpRouteHandler } from '../tracing_channels.ts'

/**
 * Executor to execute the route middleware pipeline the route
 * handler
 */
export function execute(
  route: RouteJSON,
  resolver: ContainerResolver<any>,
  ctx: HttpContext,
  errorResponder: ServerErrorHandler['handle']
) {
  return route.middleware
    .runner()
    .errorHandler((error) => errorResponder(error, ctx))
    .finalHandler(() => {
      if (typeof route.handler === 'function') {
        return (
          httpRouteHandler.tracePromise(
            ($ctx: HttpContext) => Promise.resolve((route.handler as Function)($ctx)),
            route,
            undefined,
            ctx
          ) as unknown as Promise<any>
        ).then(useReturnValue(ctx))
      }

      return (
        httpRouteHandler.tracePromise(
          route.handler.handle,
          route,
          undefined,
          resolver,
          ctx
        ) as unknown as Promise<any>
      ).then(useReturnValue(ctx))
    })
    .run(async (middleware, next) => {
      if (typeof middleware === 'function') {
        return httpMiddleware.tracePromise(
          middleware,
          middleware,
          undefined,
          ctx,
          next
        ) as unknown as Promise<any>
      }

      return httpMiddleware.tracePromise(
        middleware.handle,
        middleware,
        undefined,
        resolver,
        ctx,
        next,
        middleware.args
      ) as unknown as Promise<any>
    })
}
