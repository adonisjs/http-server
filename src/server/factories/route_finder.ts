/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { ContainerResolver } from '@adonisjs/fold'

import * as errors from '../../errors.ts'
import type { Router } from '../../router/main.ts'
import type { HttpContext } from '../../http_context/main.ts'
import type { ServerErrorHandler } from '../../types/server.ts'

/**
 * Creates a route finder function that matches HTTP requests to registered routes
 *
 * This factory function returns a route handler that:
 * - Matches incoming requests against registered routes
 * - Extracts route parameters and subdomains
 * - Executes the matched route's handler and middleware
 * - Throws E_ROUTE_NOT_FOUND error for unmatched requests
 *
 * @param router - Router instance containing registered routes
 * @param resolver - Container resolver for dependency injection
 * @param ctx - HTTP context containing request/response data
 * @param errorResponder - Error handler for route execution errors
 * @returns Route execution function
 */
export function routeFinder(
  router: Router,
  resolver: ContainerResolver<any>,
  ctx: HttpContext,
  errorResponder: ServerErrorHandler['handle']
) {
  /**
   * Finds and executes a matching route for the current request
   *
   * @returns Promise that resolves when route execution completes or rejects with route not found error
   */
  return function () {
    const url = ctx.request.url()
    const method = ctx.request.method()
    const hostname = router.usingDomains ? ctx.request.hostname() : undefined
    const route = router.match(url, method, ctx.request.parsedUrl.shouldDecodeParam, hostname)

    if (route) {
      ctx.params = route.params
      ctx.subdomains = route.subdomains
      ctx.route = route.route
      ctx.routeKey = route.routeKey
      return route.route.execute(route.route, resolver, ctx, errorResponder)
    }

    return Promise.reject(new errors.E_ROUTE_NOT_FOUND([method, url]))
  }
}
