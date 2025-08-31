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
 * @param route - The route JSON object containing route information
 * @param resolver - Container resolver for dependency injection
 * @param ctx - The HTTP context instance
 * @param errorResponder - Error handler function for handling errors
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
            httpRouteHandler.hasSubscribers ? { route } : undefined,
            undefined,
            ctx
          ) as unknown as Promise<any>
        ).then(useReturnValue(ctx))
      }

      return (
        httpRouteHandler.tracePromise(
          route.handler.handle,
          httpRouteHandler.hasSubscribers ? { route } : undefined,
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
          httpMiddleware.hasSubscribers ? { middleware } : undefined,
          undefined,
          ctx,
          next
        ) as unknown as Promise<any>
      }

      return httpMiddleware.tracePromise(
        middleware.handle,
        httpMiddleware.hasSubscribers ? { middleware } : undefined,
        undefined,
        resolver,
        ctx,
        next,
        middleware.args
      ) as unknown as Promise<any>
    })
}
