/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { RuntimeException } from '@poppinss/utils/exception'
import { RouteTable, extractRouteParams, type RouteToken } from '@boringnode/route-matcher'

import type {
  RouteJSON,
  MatchedRoute,
  StoreDomainNode,
  StoreMethodNode,
  StoreRoutesTree,
} from '../types/route.ts'
import debug from '../debug.ts'
import { parseRoute } from '../helpers.ts'

/**
 * Store class is used to store a list of routes, along side with their tokens
 * to match the URLs.
 *
 * ```ts
 * const store = new Store()
 *
 * store.add({
 *  pattern: 'posts/:id',
 *  handler: function onRoute () {},
 *  middleware: [],
 *  matchers: {
 *    id: '^[0-9]$+'
 *  },
 *  meta: {},
 *  methods: ['GET']
 * })
 *
 * store.match('posts/1', 'GET')
 * ```
 */
export class RoutesStore {
  /**
   * Lookup indexes are kept outside the public routes tree to avoid changing
   * its observable shape.
   */
  #methodRouteTables = new WeakMap<StoreMethodNode, RouteTable<RouteJSON>>()
  #domainRouteTable = new RouteTable<RouteToken[]>()

  /**
   * A flag to know if routes for explicit domains
   * have been registered
   */
  usingDomains: boolean = false

  /**
   * Tree of registered routes and their parsed tokens
   */
  tree: StoreRoutesTree = { tokens: [], domains: {} }

  /**
   * Returns the domain node for a given domain.
   */
  #getDomainNode(domain: string): StoreDomainNode {
    if (!this.tree.domains[domain]) {
      const tokens = parseRoute(domain)
      this.tree.tokens.push(tokens)
      this.#domainRouteTable.add(tokens, tokens)
      this.tree.domains[domain] = {}
    }

    return this.tree.domains[domain]
  }

  /**
   * Returns the method node for a given domain and method.
   */
  #getMethodNode(domain: string, method: string): StoreMethodNode {
    const domainNode = this.#getDomainNode(domain)
    if (!domainNode[method]) {
      domainNode[method] = { tokens: [], routes: {}, routeKeys: {} }
      this.#methodRouteTables.set(domainNode[method], new RouteTable())
    }

    return domainNode[method]
  }

  /**
   * Creates the public match result for a route and its collected params.
   */
  #createMatchedRoute(
    route: RouteJSON,
    methodNode: StoreMethodNode,
    params: Record<string, any>,
    domain?: { tokens: RouteToken[]; hostname: string }
  ): MatchedRoute {
    return {
      route,
      routeKey: methodNode.routeKeys[route.pattern],
      params,
      subdomains: domain?.hostname ? extractRouteParams(domain.tokens, domain.hostname, false) : {},
    }
  }

  /**
   * Collects route params
   */
  #collectRouteParams(route: RouteJSON, tokens: RouteToken[]) {
    const collectedParams: Set<string> = new Set()

    for (let token of tokens) {
      if ([1, 3].includes(token.type)) {
        if (collectedParams.has(token.val)) {
          throw new RuntimeException(`Duplicate param "${token.val}" found in "${route.pattern}"`)
        } else {
          collectedParams.add(token.val)
        }
      }
    }

    const params = [...collectedParams]
    collectedParams.clear()

    return params
  }

  /**
   * Register route for a given domain and method
   */
  #registerRoute(domain: string, method: string, tokens: RouteToken[], route: RouteJSON) {
    const methodRoutes = this.#getMethodNode(domain, method)

    /*
     * Check for duplicate route for the same domain and method
     */
    if (methodRoutes.routes[route.pattern]) {
      throw new RuntimeException(
        `Duplicate route found. "${method}: ${route.pattern}" route already exists`
      )
    }

    if (debug.enabled) {
      debug('registering route to the store %O', route)
      debug('route middleware %O', route.middleware.all().entries())
    }

    this.#methodRouteTables.get(methodRoutes)!.add(tokens, route)

    methodRoutes.tokens.push(tokens)
    methodRoutes.routes[route.pattern] = route
    methodRoutes.routeKeys[route.pattern] =
      domain !== 'root' ? `${domain}-${method}-${route.pattern}` : `${method}-${route.pattern}`
  }

  /**
   * Add a route to the store
   *
   * ```ts
   * store.add({
   *   pattern: 'post/:id',
   *   methods: ['GET'],
   *   matchers: {},
   *   meta: {},
   *   handler: function handler () {
   *   }
   * })
   * ```
   * @param route - The route to add to the store
   * @returns Current RoutesStore instance for method chaining
   */
  add(route: RouteJSON): this {
    /**
     * Set flag when a custom domain is used
     */
    if (route.domain !== 'root') {
      this.usingDomains = true
    }

    /**
     * Create route node object for persistence
     */
    const routeNode: RouteJSON = { ...route }

    /**
     * Set route params
     */
    routeNode.meta.params = this.#collectRouteParams(routeNode, route.tokens)

    /**
     * Register route for every method
     */
    route.methods.forEach((method) => {
      this.#registerRoute(route.domain, method, route.tokens, routeNode)
    })

    return this
  }

  /**
   * Matches the url, method and optionally domain to pull the matching
   * route. `null` is returned when unable to match the URL against
   * registered routes.
   *
   * The domain parameter has to be a registered pattern and not the fully
   * qualified runtime domain. You must call `matchDomain` first to fetch
   * the pattern for qualified domain
   * @param url - The URL to match
   * @param method - HTTP method
   * @param shouldDecodeParam - Whether to decode parameters
   * @param domain - Optional domain tokens and hostname
   * @returns Matched route or null if no match found
   */
  match(
    url: string,
    method: string,
    shouldDecodeParam: boolean,
    domain?: { tokens: RouteToken[]; hostname: string }
  ): null | MatchedRoute {
    const domainName = domain?.tokens[0]?.old || 'root'

    const matchedDomain = this.tree.domains[domainName]
    if (!matchedDomain) {
      return null
    }

    /*
     * Next get the method node for the given method inside the domain. If
     * method node is missing, means no routes ever got registered for that
     * method
     */
    const matchedMethod = this.tree.domains[domainName][method]
    if (!matchedMethod) {
      return null
    }

    const matchedRoute = this.#methodRouteTables.get(matchedMethod)!.match(url, shouldDecodeParam)
    if (!matchedRoute) {
      return null
    }

    return this.#createMatchedRoute(matchedRoute.value, matchedMethod, matchedRoute.params, domain)
  }

  /**
   * Match hostname against registered domains.
   * @param hostname - The hostname to match
   * @returns Array of matched domain tokens
   */
  matchDomain(hostname?: string | null): RouteToken[] {
    if (!hostname || !this.usingDomains) {
      return []
    }

    return this.#domainRouteTable.match(hostname, false)?.value ?? []
  }
}
