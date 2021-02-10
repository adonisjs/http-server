/**
 * @adonisjs/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../../adonis-typings/index.ts" />

import matchit from '@poppinss/matchit'
import { lodash } from '@poppinss/utils'
import {
  RouteNode,
  RouteJSON,
  DomainNode,
  MethodNode,
  RoutesTree,
  MatchedRoute,
  RouteStoreMatch,
} from '@ioc:Adonis/Core/Route'

import { RouterException } from '../Exceptions/RouterException'

/**
 * Store class is used to store a list of routes, along side with their tokens
 * to match the URL's. The used data structures to store information is tailored
 * for quick lookups.
 *
 * @example
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
export class Store {
  public tree: RoutesTree = { tokens: [], domains: {} }

  /**
   * The [[matchDomainReal]] and [[matchDomainNoop]] functions are two
   * implementation of matching a domain. We use noop implementation
   * by default and once an explicit domain is registered, we
   * pivot to [[matchDomainReal]].
   *
   * This all is done for performance, since we have noticed around 8-10%
   * improvement.
   */
  private matchDomainReal = function (domain: string): RouteStoreMatch[] {
    return matchit.match(domain || 'root', this.tree.tokens)
  }.bind(this)

  private matchDomainNoop = function (_: string): RouteStoreMatch[] {
    return []
  }.bind(this)

  /**
   * The implementation used for matching domain. Will pivot to `matchDomainReal`
   * when one or more domains will be defined
   */
  public matchDomain = this.matchDomainNoop

  /**
   * Returns the domain node for a given domain. If domain node is missing,
   * it will added to the routes object and tokens are also generated
   */
  private getDomainNode(domain: string): DomainNode {
    if (!this.tree.domains[domain]) {
      /**
       * The tokens are required to match dynamic domains
       */
      this.tree.tokens.push(matchit.parse(domain))
      this.tree.domains[domain] = {}
    }

    return this.tree.domains[domain]
  }

  /**
   * Returns the method node for a given domain and method. If method is
   * missing, it will be added to the domain node
   */
  private getMethodRoutes(domain: string, method: string): MethodNode {
    const domainNode = this.getDomainNode(domain)
    if (!domainNode[method]) {
      domainNode[method] = { tokens: [], routes: {} }
    }

    return domainNode[method]
  }

  /**
   * Adds a route to the store for all the given HTTP methods. Also an array
   * of tokens is generated for the route pattern. The tokens are then
   * matched against the URL to find the appropriate route.
   *
   * @example
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
  public add(route: RouteJSON): this {
    /*
     * Create a copy of route properties by cherry picking
     * fields. We create the copy outside the forEach
     * loop, so that the same object is shared across
     * all the methods (saving memory).
     *
     * Also sharing a single route note among all the methods is fine,
     * since we create sub-trees for each method to make the lookups
     * fast.
     */
    const routeJSON = {} as RouteNode
    lodash.merge(
      routeJSON,
      lodash.pick(route, ['pattern', 'handler', 'meta', 'middleware', 'name'])
    )

    /*
     * An explicit domain is defined
     */
    if (route.domain && route.domain !== 'root' && this.matchDomain !== this.matchDomainReal) {
      this.matchDomain = this.matchDomainReal
    }

    /*
     * Generate tokens for the given route and push to the list
     * of tokens
     */
    const tokens = matchit.parse(route.pattern, route.matchers)
    const collectedParams: Set<string> = new Set()

    /**
     * Avoiding duplicate route params
     */
    for (let token of tokens) {
      if ([1, 3].includes(token.type)) {
        if (collectedParams.has(token.val)) {
          throw RouterException.duplicateRouteParam(token.val, route.pattern)
        } else {
          collectedParams.add(token.val)
        }
      }
    }

    collectedParams.clear()

    route.methods.forEach((method) => {
      const methodRoutes = this.getMethodRoutes(route.domain || 'root', method)

      /*
       * Ensure that route doesn't pre-exists. In that case, we need to throw
       * the exception, since it's a programmer error to create multiple
       * routes with the same pattern on the same method.
       */
      if (methodRoutes.routes[route.pattern]) {
        throw RouterException.duplicateRoute(method, route.pattern)
      }

      methodRoutes.tokens.push(tokens)

      /*
       * Store reference to the route, so that we can return it to the user, when
       * they call `match`.
       */
      methodRoutes.routes[route.pattern] = routeJSON
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
  public match(
    url: string,
    method: string,
    domain?: { storeMatch: RouteStoreMatch[]; value: string }
  ): null | MatchedRoute {
    const matchingDomain = domain && domain.storeMatch[0] && domain.storeMatch[0].old
    const domainName = matchingDomain || 'root'

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
      routeKey: matchingDomain
        ? `${matchingDomain}-${method}-${route.pattern}`
        : `${method}-${route.pattern}`,
      params: matchit.exec(url, matchedRoute),
      subdomains: domain?.value ? matchit.exec(domain.value, domain.storeMatch) : {},
    }
  }
}
