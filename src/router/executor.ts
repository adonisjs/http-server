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
      /**
       * Tracing channels are only used when someone is listening. Otherwise
       * the handlers are called directly to skip the tracePromise overhead.
       */
      if (typeof route.handler === 'function') {
        const handler = route.handler
        const promise = httpRouteHandler.hasSubscribers
          ? httpRouteHandler.tracePromise(
              ($ctx: HttpContext) => Promise.resolve(handler($ctx)),
              { route },
              undefined,
              ctx
            )
          : Promise.resolve(handler(ctx))

        return promise.then(useReturnValue(ctx))
      }

      const promise = httpRouteHandler.hasSubscribers
        ? httpRouteHandler.tracePromise(route.handler.handle, { route }, undefined, resolver, ctx)
        : route.handler.handle(resolver, ctx)

      return promise.then(useReturnValue(ctx))
    })
    .run(async (middleware, next) => {
      if (typeof middleware === 'function') {
        if (!httpMiddleware.hasSubscribers) {
          return middleware(ctx, next)
        }
        return httpMiddleware.tracePromise(middleware, { middleware }, undefined, ctx, next)
      }

      if (!httpMiddleware.hasSubscribers) {
        return middleware.handle(resolver, ctx, next, middleware.args)
      }
      return httpMiddleware.tracePromise(
        middleware.handle,
        { middleware },
        undefined,
        resolver,
        ctx,
        next,
        middleware.args
      )
    })
}
