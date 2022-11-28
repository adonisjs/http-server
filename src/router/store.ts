/**
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// @ts-expect-error
import matchit from '@poppinss/matchit'
import lodash from '@poppinss/utils/lodash'
import { DuplicateRouteException } from '../exceptions/duplicate_route.js'
import { DuplicateRouteParamException } from '../exceptions/duplicate_route_param.js'
import type {
  RouteJSON,
  MatchedRoute,
  StoreRouteNode,
  StoreDomainNode,
  StoreMethodNode,
  StoreRoutesTree,
  MatchItRouteToken,
} from '../types/route.js'

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
   * A flag to know if routes for explicit domains
   * have been registered
   */
  #hasDomainsRegistered: boolean = false

  /**
   * Tree of registered routes and their matchit tokens
   */
  tree: StoreRoutesTree = { tokens: [], domains: {} }

  /**
   * Returns the domain node for a given domain.
   */
  #getDomainNode(domain: string): StoreDomainNode {
    if (!this.tree.domains[domain]) {
      this.tree.tokens.push(matchit.parse(domain))
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
      domainNode[method] = { tokens: [], routes: {} }
    }

    return domainNode[method]
  }

  /**
   * Collects route params
   */
  #collectRouteParams(route: StoreRouteNode, tokens: MatchItRouteToken[]) {
    const collectedParams: Set<string> = new Set()

    for (let token of tokens) {
      if ([1, 3].includes(token.type)) {
        if (collectedParams.has(token.val)) {
          throw new DuplicateRouteParamException(
            `Duplicate param "${token.val}" found in "${route.pattern}"`
          )
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
  #registerRoute(
    domain: string,
    method: string,
    tokens: MatchItRouteToken[],
    route: StoreRouteNode
  ) {
    const methodRoutes = this.#getMethodNode(domain, method)

    /*
     * Check for duplicate route for the same domain and method
     */
    if (methodRoutes.routes[route.pattern]) {
      throw new DuplicateRouteException(
        `Duplicate route found. "${method}: ${route.pattern}" route already exists`
      )
    }

    methodRoutes.tokens.push(tokens)
    methodRoutes.routes[route.pattern] = route
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
   */
  add(route: RouteJSON): this {
    /**
     * Set flag when a custom domain is used
     */
    if (route.domain !== 'root') {
      this.#hasDomainsRegistered = true
    }

    /**
     * Generate tokens for the route
     */
    const tokens = matchit.parse(route.pattern, route.matchers)

    /**
     * Create route node object for persistence
     */
    const routeNode: StoreRouteNode = lodash.merge(
      { meta: {} },
      lodash.pick(route, ['pattern', 'handler', 'meta', 'middleware', 'name'])
    )

    /**
     * Set route params
     */
    routeNode.meta.params = this.#collectRouteParams(routeNode, tokens)

    /**
     * Register route for every method
     */
    route.methods.forEach((method) => {
      this.#registerRoute(route.domain, method, tokens, routeNode)
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
   */
  match(
    url: string,
    method: string,
    domain?: { tokens: MatchItRouteToken[]; hostname: string }
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

    /*
     * Next, match route for the given url inside the tokens list for the
     * matchedMethod
     */
    const matchedRoute = matchit.match(url, matchedMethod.tokens)
    if (!matchedRoute.length) {
      return null
    }

    const route = matchedMethod.routes[matchedRoute[0].old]
    return {
      route: route,
      routeKey:
        domainName !== 'root'
          ? `${domainName}-${method}-${route.pattern}`
          : `${method}-${route.pattern}`,
      params: matchit.exec(url, matchedRoute),
      subdomains: domain?.hostname ? matchit.exec(domain.hostname, domain.tokens) : {},
    }
  }

  /**
   * Match hostname against registered domains.
   */
  matchDomain(hostname?: string): MatchItRouteToken[] {
    if (!hostname || !this.#hasDomainsRegistered) {
      return []
    }

    return matchit.match(hostname, this.tree.tokens)
  }
}
