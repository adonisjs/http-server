/**
 * @module @poppinss/http-server
 */

/*
* @poppinss/http-server
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import {
  RouteMatchers,
  RouteNode,
  RouterContract,
  MatchedRoute,
  RouteLookupNode,
  RouteHandlerNode,
} from '../contracts'
import { Exception } from '@poppinss/utils'

import { Route } from './Route'
import { RouteResource } from './Resource'
import { RouteGroup } from './Group'
import { BriskRoute } from './BriskRoute'
import { Store } from './Store'
import { toRoutesJSON, exceptionCodes, makeUrl } from '../helpers'

/**
 * Router class exposes unified API to create new routes, group them or
 * create route resources.
 *
 * @example
 * ```ts
 * const router = new Router()
 *
 * router.get('/', async function () {
 *   // handle request
 * })
 * ```
 */
export class Router<Context> implements RouterContract<Context> {
  /**
   * Collection of routes, including route resource and route
   * group. To get a flat list of routes, call `router.toJSON()`
   */
  public routes: (Route<Context> | RouteResource<Context> | RouteGroup<Context> | BriskRoute<Context>)[] = []

  /**
   * Exposing BriskRoute, RouteGroup and RouteResource constructors
   * to be extended from outside
   */
  public BriskRoute = BriskRoute
  public RouteGroup = RouteGroup
  public RouteResource = RouteResource
  public Route = Route

  /**
   * Global matchers to test route params against regular expressions.
   */
  private _matchers: RouteMatchers = {}

  /**
   * Store with tokenized routes
   */
  private _store: Store<Context> = new Store()

  /**
   * Lookup store to find route by it's name, handler or pattern
   * and then form a complete URL from it
   */
  private _lookupStore: RouteLookupNode<Context>[] = []

  /**
   * A boolean to tell the router that a group is in
   * open state right now
   */
  private _openedGroups: RouteGroup<Context>[] = []

  /**
   * Controllers namespace to shorten the path
   */
  private _namespace: string = 'App/Controllers/Http'

  /**
   * A counter to create unique routes during tests
   */
  private _testRoutePatternCounter = 0

  private _getRecentGroup () {
    return this._openedGroups[this._openedGroups.length - 1]
  }

  /**
   * A handler to handle routes created for testing
   */
  private _testsHandler: RouteHandlerNode<Context> = async () => {
    return 'handled by tests handler'
  }

  constructor (private _routeProcessor?: (route: RouteNode<Context>) => void) {
  }

  /**
   * Add route for a given pattern and methods
   */
  public route (pattern: string, methods: string[], handler: RouteHandlerNode<Context>): Route<Context> {
    const route = new Route(pattern, methods, handler, this._namespace, this._matchers)
    const openedGroup = this._getRecentGroup()

    if (openedGroup) {
      openedGroup.routes.push(route)
    } else {
      this.routes.push(route)
    }

    return route
  }

  /**
   * Define a route that handles all common HTTP methods
   */
  public any (pattern: string, handler: RouteHandlerNode<Context>): Route<Context> {
    return this.route(pattern, ['HEAD', 'OPTIONS','GET', 'POST', 'PUT', 'PATCH', 'DELETE'], handler)
  }

  /**
   * Define `GET` route
   */
  public get (pattern: string, handler: RouteHandlerNode<Context>): Route<Context> {
    return this.route(pattern, ['GET'], handler)
  }

  /**
   * Define `POST` route
   */
  public post (pattern: string, handler: RouteHandlerNode<Context>): Route<Context> {
    return this.route(pattern, ['POST'], handler)
  }

  /**
   * Define `PUT` route
   */
  public put (pattern: string, handler: RouteHandlerNode<Context>): Route<Context> {
    return this.route(pattern, ['PUT'], handler)
  }

  /**
   * Define `PATCH` route
   */
  public patch (pattern: string, handler: RouteHandlerNode<Context>): Route<Context> {
    return this.route(pattern, ['PATCH'], handler)
  }

  /**
   * Define `DELETE` route
   */
  public destroy (pattern: string, handler: RouteHandlerNode<Context>): Route<Context> {
    return this.route(pattern, ['DELETE'], handler)
  }

  /**
   * Creates a group of routes. A route group can apply transforms
   * to routes in bulk
   */
  public group (callback: () => void): RouteGroup<Context> {
    /**
     * Create a new group with empty set of routes
     */
    const group = new RouteGroup([])

    /**
     * See if there is any opened existing route groups. If yes, then we
     * push this new group to the old group, otherwise we push it to
     * the list of routes.
     */
    const openedGroup = this._getRecentGroup()
    if (openedGroup) {
      openedGroup.routes.push(group)
    } else {
      this.routes.push(group)
    }

    /**
     * Track the group, so that the upcoming calls inside the callback
     * can use this group
     */
    this._openedGroups.push(group)

    /**
     * Execute the callback. Now all registered routes will be
     * collected seperately from the `routes` array
     */
    callback()

    /**
     * Now the callback is over, get rid of the opened group
     */
    this._openedGroups.pop()

    return group
  }

  /**
   * Registers a route resource with conventional set of routes
   */
  public resource (resource: string, controller: string): RouteResource<Context> {
    const resourceInstance = new RouteResource(resource, controller, this._namespace, this._matchers)
    const openedGroup = this._getRecentGroup()

    if (openedGroup) {
      openedGroup.routes.push(resourceInstance)
    } else {
      this.routes.push(resourceInstance)
    }

    return resourceInstance
  }

  /**
   * Register a route resource with shallow nested routes.
   */
  public shallowResource (resource: string, controller: string): RouteResource<Context> {
    const resourceInstance = new RouteResource(resource, controller, this._namespace, this._matchers, true)
    const openedGroup = this._getRecentGroup()

    if (openedGroup) {
      openedGroup.routes.push(resourceInstance)
    } else {
      this.routes.push(resourceInstance)
    }

    return resourceInstance
  }

  /**
   * Returns a brisk route instance for a given URL pattern
   */
  public on (pattern: string): BriskRoute<Context> {
    const briskRoute = new BriskRoute(pattern, this._namespace, this._matchers)
    const openedGroup = this._getRecentGroup()

    if (openedGroup) {
      openedGroup.routes.push(briskRoute)
    } else {
      this.routes.push(briskRoute)
    }

    return briskRoute
  }

  /**
   * Define global route matcher
   */
  public where (param: string, matcher: string | RegExp): this {
    this._matchers[param] = typeof (matcher) === 'string' ? new RegExp(matcher) : matcher
    return this
  }

  /**
   * Define global controllers namespace for all the
   * routes
   */
  public namespace (namespace: string): this {
    this._namespace = namespace
    return this
  }

  /**
   * Returns a flat list of routes JSON
   */
  public toJSON () {
    return toRoutesJSON(this.routes)
  }

  /**
   * Commit routes to the store. After this, no more
   * routes can be registered.
   */
  public commit () {
    const names: string[] = []

    this.toJSON().forEach((route) => {
      /**
       * Raise error when route name is already in use. Route names have to be unique
       * to ensure that only one route is returned during lookup.
       */
      if (route.name && names.indexOf(route.name) > -1) {
        throw new Exception(
          `Duplicate route name \`${route.name}\``,
          500,
          exceptionCodes.E_DUPLICATE_ROUTE_NAME,
        )
      }

      /**
       * If route has a unique, then track the name for checking duplicates
       */
      if (route.name) {
        names.push(route.name)
      }

      /**
       * If a pre-processor is defined then pass the [[RouteNode]]
       * to it.
       */
      if (this._routeProcessor) {
        this._routeProcessor(route)
      }

      /**
       * Maintain an array of values, using which a route can be lookedup. The `handler` lookup
       * only works, when Handler is defined as a string
       */
      this._lookupStore.push({
        handler: route.handler,
        name: route.name,
        pattern: route.pattern,
        domain: route.domain || 'root',
      })

      this._store.add(route)
    })

    this.routes = []
    this._matchers = {}
  }

  /**
   * Find route for a given URL, method and optionally domain
   */
  public find (url: string, method: string, domain?: string): null | MatchedRoute<Context> {
    return this._store.match(url, method, domain)
  }

  /**
   * Makes the URL for a pre-registered route. The `params` is required to
   * substitute values for dynamic segments and `qs` is optional for
   * adding query string.
   *
   * If the domain for the route is defined, then a protocol relative URL for that
   * domain will be returned.
   */
  public urlFor (pattern: string, options: { params?: any, qs?: any }, domain?: string): null | string {
    options = Object.assign({ params: {}, qs: {} }, options)

    /**
     * Find where route pattern or name or handler matches
     */
    const matchingRoute = this._lookupStore.find((route) => {
      return [route.name, route.pattern, route.handler].indexOf(pattern) > -1 && (!domain || domain === route.domain)
    })

    /**
     * Return null if unable to lookup route
     */
    if (!matchingRoute) {
      return null
    }

    const url = makeUrl(matchingRoute.pattern, options)
    return matchingRoute.domain !== 'root' ? `//${matchingRoute.domain}${url}` : url
  }

  /**
   * Creates a route when writing tests and auto-commits it to the
   * routes store. Do not use this method inside your routes file.
   *
   * The global matchers doesn't work for testing routes and hence you have
   * define inline matchers (if required). Also testing routes should be
   * created to test the route functionality, they should be created to
   * test middleware or validators by hitting a route from outside in.
   */
  public forTesting (
    pattern?: string,
    methods?: string[],
    handler?: RouteHandlerNode<Context>,
  ): Route<Context> {
    pattern = pattern || `_test_${this._testRoutePatternCounter++}`
    methods = methods || ['GET']
    handler = handler || this._testsHandler

    const route = this.route(pattern, methods, handler)
    this.commit()

    return route
  }
}
