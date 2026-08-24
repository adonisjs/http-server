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
  StoreMethodNode,
  StoreRoutesTree,
  MatchItRouteToken,
} from '../types/route.ts'
import debug from '../debug.ts'
import { parseRoute } from '../helpers.ts'

type IndexedStaticRoute = {
  route: RouteJSON
  precedingDynamicRoutesCount: number
}

type MethodNodeIndex = {
  staticRoutes: Map<string, IndexedStaticRoute>
  dynamicRoutes: MatchItRouteToken[][]
}

type ParsedRouteToken = MatchItRouteToken & {
  matcher?: RegExp
}

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
  #methodNodeIndexes = new WeakMap<StoreMethodNode, MethodNodeIndex>()

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
  #getMethodNode(domain: string, method: string): StoreMethodNode {
    const domainNode = this.#getDomainNode(domain)
    if (!domainNode[method]) {
      domainNode[method] = { tokens: [], routes: {}, routeKeys: {} }
    }

    return domainNode[method]
  }

  /**
   * Returns an index key for a static route. Empty token lists are excluded,
   * since matchit does not treat them as static routes.
   */
  #getStaticRouteKey(tokens: MatchItRouteToken[]): string | null {
    if (!tokens.length || tokens.some((token) => token.type !== 0)) {
      return null
    }

    return tokens.length === 1 && tokens[0].val === '/'
      ? 'root'
      : `segments:${tokens.map((token) => token.val).join('/')}`
  }

  /**
   * Removes a single leading and trailing slash, just like matchit.
   */
  #stripRoutePath(pathname: string): string {
    if (pathname === '/') {
      return pathname
    }

    if (pathname.charCodeAt(0) === 47) {
      pathname = pathname.substring(1)
    }

    const lastIndex = pathname.length - 1
    if (pathname.charCodeAt(lastIndex) === 47) {
      pathname = pathname.substring(0, lastIndex)
    }

    return pathname
  }

  /**
   * Returns the static index key for a request path.
   */
  #getStaticRequestKey(pathname: string): string {
    pathname = this.#stripRoutePath(pathname)
    return pathname === '/' ? 'root' : `segments:${pathname}`
  }

  /**
   * Matches a prefix of routes using matchit's matching semantics. Limiting the
   * scan prevents routes registered after a static candidate from producing
   * observable matcher side effects or errors.
   */
  #matchRoutesBefore(
    pathname: string,
    routes: MatchItRouteToken[][],
    routesCount: number
  ): MatchItRouteToken[] {
    if (!routesCount) {
      return []
    }

    pathname = this.#stripRoutePath(pathname)
    const segments = pathname === '/' ? ['/'] : pathname.split('/')
    const segmentsCount = segments.length

    for (let routeIndex = 0; routeIndex < routesCount; routeIndex++) {
      const tokens = routes[routeIndex]
      const tokensCount = tokens.length

      if (
        tokensCount !== segmentsCount &&
        !(tokensCount < segmentsCount && tokens[tokensCount - 1].type === 2) &&
        !(tokensCount > segmentsCount && tokens[tokensCount - 1].type === 3)
      ) {
        continue
      }

      let matches = true
      for (let tokenIndex = 0; tokenIndex < tokensCount; tokenIndex++) {
        const token = tokens[tokenIndex] as ParsedRouteToken
        const segment = segments[tokenIndex]

        if (token.val === segment && token.type === 0) {
          continue
        }
        if (segment === '/') {
          matches = token.type > 1
        } else if (token.type === 0) {
          matches = false
        } else if (segment === '') {
          matches = token.end === '' && (token.matcher ? token.matcher.test(segment) : true)
        } else if (!segment) {
          matches = token.end === ''
        } else {
          matches =
            segment.endsWith(token.end) && (token.matcher ? token.matcher.test(segment) : true)
        }

        if (!matches) {
          break
        }
      }

      if (matches) {
        return tokens
      }
    }

    return []
  }

  /**
   * Creates the public match result for a route and its collected params.
   */
  #createMatchedRoute(
    route: RouteJSON,
    methodNode: StoreMethodNode,
    params: Record<string, any>,
    domain?: { tokens: MatchItRouteToken[]; hostname: string }
  ): MatchedRoute {
    return {
      route,
      routeKey: methodNode.routeKeys[route.pattern],
      params,
      subdomains: domain?.hostname ? matchit.exec(domain.hostname, domain.tokens) : {},
    }
  }

  /**
   * Creates the static index lazily. Routes registered before the first static
   * route are copied to the dynamic fallback in their original order.
   */
  #createMethodNodeIndex(methodNode: StoreMethodNode): MethodNodeIndex {
    const index: MethodNodeIndex = {
      staticRoutes: new Map(),
      dynamicRoutes: methodNode.tokens.slice(),
    }
    this.#methodNodeIndexes.set(methodNode, index)
    return index
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

    const staticRouteKey = this.#getStaticRouteKey(tokens)
    let methodNodeIndex = this.#methodNodeIndexes.get(methodRoutes)

    if (staticRouteKey !== null) {
      methodNodeIndex ||= this.#createMethodNodeIndex(methodRoutes)
      if (!methodNodeIndex.staticRoutes.has(staticRouteKey)) {
        methodNodeIndex.staticRoutes.set(staticRouteKey, {
          route,
          precedingDynamicRoutesCount: methodNodeIndex.dynamicRoutes.length,
        })
      }
    } else if (methodNodeIndex) {
      methodNodeIndex.dynamicRoutes.push(tokens)
    }

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

    const methodNodeIndex = this.#methodNodeIndexes.get(matchedMethod)
    if (methodNodeIndex) {
      const staticRoute = methodNodeIndex.staticRoutes.get(this.#getStaticRequestKey(url))

      const dynamicRoute = staticRoute
        ? this.#matchRoutesBefore(
            url,
            methodNodeIndex.dynamicRoutes,
            staticRoute.precedingDynamicRoutesCount
          )
        : matchit.match(url, methodNodeIndex.dynamicRoutes)
      if (!dynamicRoute.length) {
        if (!staticRoute) {
          return null
        }

        return this.#createMatchedRoute(staticRoute.route, matchedMethod, {}, domain)
      }

      const route = matchedMethod.routes[dynamicRoute[0].old]
      return this.#createMatchedRoute(
        route,
        matchedMethod,
        matchit.exec(url, dynamicRoute, shouldDecodeParam),
        domain
      )
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
    return this.#createMatchedRoute(
      route,
      matchedMethod,
      matchit.exec(url, matchedRoute, shouldDecodeParam),
      domain
    )
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
