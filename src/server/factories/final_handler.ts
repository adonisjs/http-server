/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { ContainerResolver } from '@adonisjs/fold'

import * as errors from '../../exceptions/main.js'
import type { Router } from '../../router/main.js'
import type { HttpContext } from '../../http_context/main.js'

/**
 * The final handler is executed after the server middleware stack.
 * It looks for a matching route and executes the route middleware
 * stack.
 */
export function finalHandler(router: Router, resolver: ContainerResolver<any>, ctx: HttpContext) {
  return function () {
    const url = ctx.request.url()
    const method = ctx.request.method()
    const hostname = router.usingDomains ? ctx.request.hostname() : undefined
    const route = router.match(url, method, hostname)

    if (route) {
      ctx.params = route.params
      ctx.subdomains = route.subdomains
      ctx.route = route.route
      ctx.routeKey = route.routeKey
      return route.route.execute(route.route, resolver, ctx)
    }

    return Promise.reject(new errors.E_ROUTE_NOT_FOUND([method, url]))
  }
}
