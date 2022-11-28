/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { RouteJSON } from '../../types/route.js'
import { CannotLookupRouteException } from '../../exceptions/cannot_lookup_route.js'

/**
 * Route finder is used to find a route by its name, route pattern
 * or the controller.method name.
 */
export class RouteFinder {
  #routes: RouteJSON[]
  constructor(routes: RouteJSON[]) {
    this.#routes = routes
  }

  /**
   * Find a route by indentifier
   */
  find(routeIdentifier: string): RouteJSON | null {
    return (
      this.#routes.find(({ name, pattern, handler }) => {
        if (name === routeIdentifier || pattern === routeIdentifier) {
          return true
        }

        if (typeof handler === 'function') {
          return false
        }

        return handler.name === routeIdentifier
      }) || null
    )
  }

  /**
   * Find a route by indentifier or fail
   */
  findOrFail(routeIdentifier: string): RouteJSON {
    const route = this.find(routeIdentifier)
    if (!route) {
      throw new CannotLookupRouteException(`Cannot lookup route "${routeIdentifier}"`)
    }

    return route
  }

  /**
   * Find if a route exists
   */
  has(routeIdentifier: string): boolean {
    return !!this.find(routeIdentifier)
  }
}
