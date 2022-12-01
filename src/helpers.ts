/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Cache from 'tmp-cache'
import { Route } from './router/route.js'
import { BriskRoute } from './router/brisk.js'
import { RouteGroup } from './router/group.js'
import type { RouteJSON } from './types/route.js'
import { RouteResource } from './router/resource.js'
import type { HttpContext } from './http_context/main.js'

const proxyCache = new Cache({ max: 200 })

/**
 * Makes input string consistent by having only the starting
 * slash
 */
export function dropSlash(input: string): string {
  if (input === '/') {
    return '/'
  }

  return `/${input.replace(/^\//, '').replace(/\/$/, '')}`
}

/**
 * Returns a flat list of routes from the route groups and resources
 */
export function toRoutesJSON(
  routes: (RouteGroup | Route | RouteResource | BriskRoute)[]
): RouteJSON[] {
  return routes.reduce((list: RouteJSON[], route) => {
    if (route instanceof RouteGroup) {
      list = list.concat(toRoutesJSON(route.routes))
      return list
    }

    if (route instanceof RouteResource) {
      list = list.concat(toRoutesJSON(route.routes))
      return list
    }

    if (route instanceof BriskRoute) {
      if (route.route && !route.route.isDeleted()) {
        list.push(route.route.toJSON())
      }
      return list
    }

    if (!route.isDeleted()) {
      list.push(route.toJSON())
    }

    return list
  }, [])
}

/**
 * Helper to know if the remote address should
 * be trusted.
 */
export function trustProxy(
  remoteAddress: string,
  proxyFn: (addr: string, distance: number) => boolean
): boolean {
  if (proxyCache.has(remoteAddress)) {
    return proxyCache.get(remoteAddress) as boolean
  }

  const result = proxyFn(remoteAddress, 0)
  proxyCache.set(remoteAddress, result)
  return result
}

/**
 * Returns a boolean telling if the return value should be used as
 * the response body or not
 */
export function shouldUseReturnValue(returnValue: any, ctx: HttpContext) {
  return (
    returnValue !== undefined && // Return value is explicitly defined
    returnValue !== ctx.response && // Return value is not the instance of response object
    !ctx.response.hasLazyBody // Lazy body is not set
  )
}
