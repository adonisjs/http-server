/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type Encryption from '@adonisjs/encryption'

import { UrlBuilder } from './url_builder.js'
import { RouteFinder } from './route_finder.js'
import type { RouteJSON } from '../../types/route.js'

/**
 * Lookup store exposes the API to lookup routes and
 * make URLs for registered routes.
 */
export class LookupStore {
  /**
   * List of routes grouped by domain
   */
  #routes: { [domain: string]: RouteJSON[] } = {}
  #encryption: Encryption

  constructor(encryption: Encryption) {
    this.#encryption = encryption
  }

  /**
   * Register route JSON payload
   */
  register(route: RouteJSON) {
    this.#routes[route.domain] = this.#routes[route.domain] || []
    this.#routes[route.domain].push(route)
  }

  /**
   * Returns an instance of the URL builder for making
   * route URIs
   */
  builder() {
    return this.builderForDomain('root')
  }

  /**
   * Returns an instance of the URL builder for a specific
   * domain.
   */
  builderForDomain(domain: string) {
    const routes = this.#routes[domain]
    return new UrlBuilder(this.#encryption, new RouteFinder(routes || []))
  }

  /**
   * Finds a route by its identifier. The identifier can be the
   * route name, controller.method name or the route pattern
   * itself.
   */
  find(routeIdentifier: string, domain?: string): RouteJSON | null {
    const routes = this.#routes[domain || 'root'] || []
    return new RouteFinder(routes).find(routeIdentifier)
  }

  /**
   * Finds a route by its identifier. The identifier can be the
   * route name, controller.method name or the route pattern
   * itself.
   *
   * An error is raised when unable to find the route.
   */
  findOrFail(routeIdentifier: string, domain?: string): RouteJSON {
    const routes = this.#routes[domain || 'root'] || []
    return new RouteFinder(routes).findOrFail(routeIdentifier)
  }

  /**
   * Check if a route exists. The identifier can be the
   * route name, controller.method name or the route pattern
   * itself.
   */
  has(routeIdentifier: string, domain?: string): boolean {
    const routes = this.#routes[domain || 'root'] || []
    return new RouteFinder(routes).has(routeIdentifier)
  }

  toJSON() {
    return this.#routes
  }
}
