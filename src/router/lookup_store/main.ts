/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Encryption } from '@adonisjs/encryption'

import type { Qs } from '../../qs.js'
import { UrlBuilder } from './url_builder.js'
import { RouteFinder } from './route_finder.js'
import type { RouteJSON } from '../../types/route.js'
import { E_CANNOT_LOOKUP_ROUTE } from '../../exceptions.js'

/**
 * Lookup store exposes the API to lookup routes and
 * make URLs for registered routes.
 */
export class LookupStore {
  /**
   * List of route finders grouped by domains
   */
  #routes: { [domain: string]: RouteFinder } = {}

  /**
   * Encryption for making URLs
   */
  #encryption: Encryption

  /**
   * Query string parser for making URLs
   */
  #qsParser: Qs

  constructor(encryption: Encryption, qsParser: Qs) {
    this.#encryption = encryption
    this.#qsParser = qsParser
  }

  /**
   * Register route JSON payload
   */
  register(route: RouteJSON) {
    this.#routes[route.domain] = this.#routes[route.domain] || new RouteFinder()
    this.#routes[route.domain].register(route)
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
    const finder = this.#routes[domain]
    return new UrlBuilder(this.#encryption, finder || new RouteFinder(), this.#qsParser)
  }

  /**
   * Finds a route by its identifier. The identifier can be the
   * route name, controller.method name or the route pattern
   * itself.
   */
  find(routeIdentifier: string, domain?: string): RouteJSON | null {
    const finder = this.#routes[domain || 'root']
    if (!finder) {
      return null
    }

    return finder.find(routeIdentifier)
  }

  /**
   * Finds a route by its identifier. The identifier can be the
   * route name, controller.method name or the route pattern
   * itself.
   *
   * An error is raised when unable to find the route.
   */
  findOrFail(routeIdentifier: string, domain?: string): RouteJSON {
    const finder = this.#routes[domain || 'root']
    if (!finder) {
      throw new E_CANNOT_LOOKUP_ROUTE([routeIdentifier])
    }

    return finder.findOrFail(routeIdentifier)
  }

  /**
   * Check if a route exists. The identifier can be the
   * route name, controller.method name or the route pattern
   * itself.
   */
  has(routeIdentifier: string, domain?: string): boolean {
    const finder = this.#routes[domain || 'root']
    if (!finder) {
      return false
    }

    return finder.has(routeIdentifier)
  }

  toJSON() {
    return Object.keys(this.#routes).reduce<Record<string, RouteJSON[]>>((result, domain) => {
      result[domain] = this.#routes[domain].toJSON()
      return result
    }, {})
  }
}
