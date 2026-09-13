/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// @ts-expect-error
import matchit from '@poppinss/matchit'
import { RuntimeException } from '@poppinss/utils/exception'

import type {
  RouteJSON,
  MatchedRoute,
  StoreDomainNode,
  StoreRoutesTree,
  MatchItRouteToken,
  IndexedStoreMethodNode,
} from '../types/route.ts'
import debug from '../debug.ts'
import { parseRoute } from '../helpers.ts'

/**
 * Number of routes registered for a single domain and method below which route
 * matching scans every token array instead of consulting the static prefix
 * index. See `#matchRoute`.
 */
const SMALL_TABLE_ROUTES = 64

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
  usingDomains: boolean = false

  /**
   * Tree of registered routes and their matchit tokens
   */
  tree: StoreRoutesTree = { tokens: [], domains: {} }

  /**
   * Returns the domain node for a given domain.
   */
  #getDomainNode(domain: string): StoreDomainNode {
    if (!this.tree.domains[domain]) {
      this.tree.tokens.push(parseRoute(domain))
      this.tree.domains[domain] = {}
    }

    return this.tree.domains[domain]
  }

  /**
   * Returns the method node for a given domain and method.
   */
  #getMethodNode(domain: string, method: string): IndexedStoreMethodNode {
    const domainNode = this.#getDomainNode(domain)
    if (!domainNode[method]) {
      domainNode[method] = {
        tokens: [],
        routesByStaticPrefix: null,
        routesWithoutStaticPrefix: [],
        tokenIndexes: new Map(),
        shadowTokens: [],
        routes: {},
        routeKeys: {},
        lastUrl: null,
        lastTokens: [],
        lastRoute: null,
        lastRouteKey: '',
        lastHasParams: false,
        staticRoutes: null,
      } satisfies IndexedStoreMethodNode
    }

    return domainNode[method] as IndexedStoreMethodNode
  }

  /**
   * Narrows route matching to patterns sharing the URL's leading static segments.
   *
   * Every group is kept in registration order, and `matchit.match` returns the
   * first entry of a group that matches. Therefore matching each group on its
   * own and keeping the winner with the lowest registration index selects the
   * same route as matching the merged groups in registration order, without
   * having to build and sort a merged array on every request.
   */
  #matchRoute(url: string, methodRoutes: IndexedStoreMethodNode): MatchItRouteToken[] {
    /**
     * Narrowing has a fixed cost per request: slicing the path at every segment
     * boundary and looking each slice up. Below a small number of routes a plain
     * scan over every token array is cheaper than that bookkeeping, so the index
     * is only consulted once the table is large enough to pay for it.
     */
    if (methodRoutes.tokens.length <= SMALL_TABLE_ROUTES) {
      return matchit.match(url, methodRoutes.tokens)
    }

    let path = url
    if (path !== '/') {
      if (path.charCodeAt(0) === 47) {
        path = path.substring(1)
      }
      if (path.charCodeAt(path.length - 1) === 47) {
        path = path.substring(0, path.length - 1)
      }
    }

    const routesByStaticPrefix = methodRoutes.routesByStaticPrefix
    let matched: MatchItRouteToken[] | undefined
    let matchedIndex = 0
    let matchedIndexResolved = false
    let consultedGroup = false

    if (routesByStaticPrefix) {
      for (let index = 1; index <= path.length; index++) {
        if (index !== path.length && path.charCodeAt(index) !== 47) {
          continue
        }

        const prefixCandidates = routesByStaticPrefix[path.substring(0, index)]
        if (!prefixCandidates) {
          continue
        }

        consultedGroup = true
        const prefixMatch = matchit.match(url, prefixCandidates)
        if (!prefixMatch.length) {
          continue
        }

        /**
         * The first match wins until a second group also matches, at which
         * point registration indexes decide. Resolving them lazily keeps the
         * common single-group case free of map lookups.
         */
        if (!matched) {
          matched = prefixMatch
          continue
        }

        if (!matchedIndexResolved) {
          matchedIndex = methodRoutes.tokenIndexes.get(matched)!
          matchedIndexResolved = true
        }

        const prefixMatchIndex = methodRoutes.tokenIndexes.get(prefixMatch)!
        if (prefixMatchIndex < matchedIndex) {
          matched = prefixMatch
          matchedIndex = prefixMatchIndex
        }
      }
    }

    /**
     * Every prefix group already carries the routes without a static prefix, so
     * consulting a single group covers them too. They are only matched on their
     * own when the url shares no leading static segment with any group.
     */
    if (!consultedGroup) {
      const routesWithoutStaticPrefix = methodRoutes.routesWithoutStaticPrefix
      if (routesWithoutStaticPrefix.length) {
        return matchit.match(url, routesWithoutStaticPrefix)
      }
    }

    return matched ?? []
  }

  /**
   * Collects route params
   */
  #collectRouteParams(route: RouteJSON, tokens: MatchItRouteToken[]) {
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
  #registerRoute(domain: string, method: string, tokens: MatchItRouteToken[], route: RouteJSON) {
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

    const routeKey =
      domain !== 'root' ? `${domain}-${method}-${route.pattern}` : `${method}-${route.pattern}`
    const tokenIndex = methodRoutes.tokens.length
    methodRoutes.tokenIndexes.set(tokens, tokenIndex)
    methodRoutes.tokens.push(tokens)
    methodRoutes.routes[route.pattern] = route
    methodRoutes.routeKeys[route.pattern] = routeKey
    this.#resetLastMatch(methodRoutes)

    let staticPrefix = ''
    if (tokens[0]?.type === 0 && tokens[0].val) {
      for (const token of tokens) {
        if (token.type !== 0) {
          break
        }
        staticPrefix = staticPrefix ? `${staticPrefix}/${token.val}` : token.val
      }
    }

    /**
     * Routes without a static prefix can match any url, so every prefix group
     * has to consider them. They are merged into the groups here rather than
     * matched separately on every request. Routes are always appended with the
     * highest registration index so far, so both branches keep every group in
     * registration order, which is the order `matchit` resolves by.
     */
    if (staticPrefix) {
      const routesByStaticPrefix = (methodRoutes.routesByStaticPrefix ??= Object.create(null))
      const prefixRoutes = (routesByStaticPrefix[staticPrefix] ??= [
        ...methodRoutes.routesWithoutStaticPrefix,
      ])
      prefixRoutes.push(tokens)
    } else {
      methodRoutes.routesWithoutStaticPrefix.push(tokens)
      const routesByStaticPrefix = methodRoutes.routesByStaticPrefix
      if (routesByStaticPrefix) {
        for (const prefix of Object.keys(routesByStaticPrefix)) {
          routesByStaticPrefix[prefix].push(tokens)
        }
      }
    }

    /**
     * A route can join the exact lookup table when its pattern is spelled the
     * same way a matching URL is, it has no dynamic segments, and no earlier
     * route matches it. `matchit` returns the first registered match, so a
     * later route can never take precedence over this one.
     *
     * Only routes tracked in `shadowTokens` can shadow a static pattern: two
     * canonical static patterns match the same URL only when the patterns are
     * identical, which the duplicate check above already rejects.
     */
    const isCanonical =
      route.pattern === '/' ||
      (route.pattern.charCodeAt(0) === 47 &&
        route.pattern.charCodeAt(route.pattern.length - 1) !== 47)
    const isStatic = tokens.length > 0 && tokens.every((token) => token.type === 0)

    if (isCanonical && isStatic) {
      if (!matchit.match(route.pattern, methodRoutes.shadowTokens).length) {
        const staticRoutes = (methodRoutes.staticRoutes ??= Object.create(null))
        staticRoutes[route.pattern] = { tokens, route, routeKey }
      }
    } else {
      methodRoutes.shadowTokens.push(tokens)
    }
  }

  /**
   * Clears the memo of the last matched URL. Called whenever a registration
   * invalidates what the node previously resolved.
   */
  #resetLastMatch(methodRoutes: IndexedStoreMethodNode) {
    methodRoutes.lastUrl = null
    methodRoutes.lastTokens = []
    methodRoutes.lastRoute = null
    methodRoutes.lastRouteKey = ''
    methodRoutes.lastHasParams = false
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
    const matchedMethod = this.tree.domains[domainName][method] as IndexedStoreMethodNode
    if (!matchedMethod) {
      return null
    }

    /*
     * Next, match route for the given url inside the tokens list for the
     * matchedMethod
     */
    let matchedRoute = matchedMethod.lastTokens
    let route = matchedMethod.lastRoute
    let routeKey = matchedMethod.lastRouteKey
    let hasParams = matchedMethod.lastHasParams

    if (matchedMethod.lastUrl !== url) {
      const staticRoute = matchedMethod.staticRoutes?.[url]
      matchedRoute = staticRoute?.tokens ?? this.#matchRoute(url, matchedMethod)

      if (!matchedRoute.length) {
        this.#resetLastMatch(matchedMethod)
        matchedMethod.lastUrl = url
        return null
      }

      route = staticRoute?.route ?? matchedMethod.routes[matchedRoute[0].old]
      routeKey = staticRoute?.routeKey ?? matchedMethod.routeKeys[route.pattern]
      hasParams = staticRoute ? false : matchedRoute.some((token) => token.type !== 0)
      matchedMethod.lastUrl = url
      matchedMethod.lastTokens = matchedRoute
      matchedMethod.lastRoute = route
      matchedMethod.lastRouteKey = routeKey
      matchedMethod.lastHasParams = hasParams
    } else if (!route) {
      return null
    }

    return {
      route,
      routeKey,
      params: hasParams ? matchit.exec(url, matchedRoute, shouldDecodeParam) : {},
      subdomains: domain?.hostname ? matchit.exec(domain.hostname, domain.tokens) : {},
    }
  }

  /**
   * Match hostname against registered domains.
   * @param hostname - The hostname to match
   * @returns Array of matched domain tokens
   */
  matchDomain(hostname?: string | null): MatchItRouteToken[] {
    if (!hostname || !this.usingDomains) {
      return []
    }

    return matchit.match(hostname, this.tree.tokens)
  }
}
