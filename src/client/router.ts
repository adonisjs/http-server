/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { type ClientRouteJSON } from './types.ts'

/**
 * The router client contains the shared logic for finding routes
 * used by the server and the client.
 */
export class RouterClient<T extends ClientRouteJSON> {
  /**
   * List of route references kept for lookup.
   */
  protected routes: { [domain: string]: T[] }

  /**
   * The lookup strategies to follow when generating URL builder
   * types and client
   */
  lookupStrategies: ('name' | 'pattern' | 'controller')[] = ['name', 'pattern']

  constructor(routes?: { [domain: string]: T[] }) {
    this.routes = routes ?? {}
  }

  /**
   * Register route JSON payload
   */
  protected register(route: T) {
    this.routes[route.domain] = this.routes[route.domain] || []
    this.routes[route.domain].push(route)
  }

  /**
   * Define the lookup strategies to follow when generating URL builder
   * types and client.
   */
  updateLookupStrategies(strategies: ('name' | 'pattern' | 'controller')[]) {
    this.lookupStrategies = strategies
    return this
  }

  /**
   * Finds a route by its identifier. The identifier can be the
   * route name, controller.method name or the route pattern
   * itself.
   *
   * When "followLookupStrategy" is enabled, the lookup will be performed
   * on the basis of the lookup strategy enabled via the "lookupStrategies"
   * method. The default lookupStrategy is "name" and "pattern".
   */
  find(
    routeIdentifier: string,
    domain?: string,
    method?: string,
    followLookupStrategy?: boolean
  ): T | null {
    /**
     * Search for route in all the domains when no domain name is
     * mentioned.
     */
    if (!domain) {
      let route: T | null = null
      for (const routeDomain of Object.keys(this.routes)) {
        route = this.find(routeIdentifier, routeDomain, method, followLookupStrategy)
        if (route) {
          break
        }
      }
      return route
    }

    const routes = this.routes[domain]
    if (!routes) {
      return null
    }

    const lookupByName = !followLookupStrategy || this.lookupStrategies.includes('name')
    const lookupByPattern = !followLookupStrategy || this.lookupStrategies.includes('pattern')
    const lookupByController = !followLookupStrategy || this.lookupStrategies.includes('controller')

    return (
      routes.find((route) => {
        if (method && !route.methods.includes(method)) {
          return false
        }

        if (
          (route.name === routeIdentifier && lookupByName) ||
          (route.pattern === routeIdentifier && lookupByPattern)
        ) {
          return true
        }

        if (typeof route.handler === 'function' || !lookupByController) {
          return false
        }

        return route.handler.reference === routeIdentifier
      }) || null
    )
  }

  /**
   * Finds a route by its identifier. The identifier can be the
   * route name, controller.method name or the route pattern
   * itself.
   *
   * An error is raised when unable to find the route.
   *
   * When "followLookupStrategy" is enabled, the lookup will be performed
   * on the basis of the lookup strategy enabled via the "lookupStrategies"
   * method. The default lookupStrategy is "name" and "pattern".
   */
  findOrFail(
    routeIdentifier: string,
    domain?: string,
    method?: string,
    followLookupStrategy?: boolean
  ): T {
    const route = this.find(routeIdentifier, domain, method, followLookupStrategy)
    if (!route) {
      throw new Error(`Cannot lookup route "${routeIdentifier}"`)
    }

    return route
  }

  /**
   * Check if a route exists. The identifier can be the
   * route name, controller.method name or the route pattern
   * itself.
   *
   * When "followLookupStrategy" is enabled, the lookup will be performed
   * on the basis of the lookup strategy enabled via the "lookupStrategies"
   * method. The default lookupStrategy is "name" and "pattern".
   */
  has(
    routeIdentifier: string,
    domain?: string,
    method?: string,
    followLookupStrategy?: boolean
  ): boolean {
    return !!this.find(routeIdentifier, domain, method, followLookupStrategy)
  }

  /**
   * Returns a list of routes grouped by their domain names
   */
  toJSON(): { [domain: string]: T[] } {
    return this.routes
  }
}
