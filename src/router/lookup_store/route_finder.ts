/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as errors from '../../exceptions.js'
import type { RouteJSON } from '../../types/route.js'

/**
 * Route finder is used to find a route by its name, route pattern
 * or the controller.method name.
 */
export class RouteFinder {
  #routes: RouteJSON[] = []

  register(route: RouteJSON) {
    this.#routes.push(route)
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

        return handler.reference === routeIdentifier
      }) || null
    )
  }

  /**
   * Find a route by indentifier or fail
   */
  findOrFail(routeIdentifier: string): RouteJSON {
    const route = this.find(routeIdentifier)
    if (!route) {
      throw new errors.E_CANNOT_LOOKUP_ROUTE([routeIdentifier])
    }

    return route
  }

  /**
   * Find if a route exists
   */
  has(routeIdentifier: string): boolean {
    return !!this.find(routeIdentifier)
  }

  /**
   * Returns an array of registered routes
   */
  toJSON() {
    return this.#routes
  }
}
