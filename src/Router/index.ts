/**
 * @adonisjs/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../../adonis-typings/index.ts" />

import { types } from '@poppinss/utils/build/helpers'
import { EncryptionContract } from '@ioc:Adonis/Core/Encryption'

import {
  RouteNode,
  RouteHandler,
  MatchedRoute,
  RouterContract,
  MakeUrlOptions,
  RouteMatchersNode,
  MakeSignedUrlOptions,
} from '@ioc:Adonis/Core/Route'

import { Route } from './Route'
import { Store } from './Store'
import { RouteGroup } from './Group'
import { BriskRoute } from './BriskRoute'
import { RouteResource } from './Resource'
import { RouterException } from '../Exceptions/RouterException'
import { toRoutesJSON, normalizeMakeUrlOptions, normalizeMakeSignedUrlOptions } from '../helpers'

import { RouteMatchers } from './Matchers'
import { LookupStore } from './LookupStore'

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
export class Router extends LookupStore implements RouterContract {
  /**
   * Collection of routes, including route resource and route
   * group. To get a flat list of routes, call `router.toJSON()`
   */
  public routes: (Route | RouteResource | RouteGroup | BriskRoute)[] = []

  /**
   * Exposing BriskRoute, RouteGroup and RouteResource constructors
   * to be extended from outside
   */
  public BriskRoute = BriskRoute
  public RouteGroup = RouteGroup
  public RouteResource = RouteResource
  public Route = Route
  public RouteMatchers = RouteMatchers

  /**
   * Shortcut methods for commonly used route matchers
   */
  public matchers = new RouteMatchers()

  /**
   * Global matchers to test route params against regular expressions.
   */
  private paramMatchers: RouteMatchersNode = {}

  /**
   * Store with tokenized routes
   */
  private store: Store = new Store()

  /**
   * A boolean to tell the router that a group is in
   * open state right now
   */
  private openedGroups: RouteGroup[] = []

  private getRecentGroup() {
    return this.openedGroups[this.openedGroups.length - 1]
  }

  constructor(encryption: EncryptionContract, private routeProcessor?: (route: RouteNode) => void) {
    super(encryption)
  }

  /**
   * Add route for a given pattern and methods
   */
  public route(pattern: string, methods: string[], handler: RouteHandler): Route {
    const route = new Route(pattern, methods, handler, this.paramMatchers)
    const openedGroup = this.getRecentGroup()

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
  public any(pattern: string, handler: RouteHandler): Route {
    return this.route(
      pattern,
      ['HEAD', 'OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      handler
    )
  }

  /**
   * Define `GET` route
   */
  public get(pattern: string, handler: RouteHandler): Route {
    return this.route(pattern, ['GET', 'HEAD'], handler)
  }

  /**
   * Define `POST` route
   */
  public post(pattern: string, handler: RouteHandler): Route {
    return this.route(pattern, ['POST'], handler)
  }

  /**
   * Define `PUT` route
   */
  public put(pattern: string, handler: RouteHandler): Route {
    return this.route(pattern, ['PUT'], handler)
  }

  /**
   * Define `PATCH` route
   */
  public patch(pattern: string, handler: RouteHandler): Route {
    return this.route(pattern, ['PATCH'], handler)
  }

  /**
   * Define `DELETE` route
   */
  public delete(pattern: string, handler: RouteHandler): Route {
    return this.route(pattern, ['DELETE'], handler)
  }

  /**
   * Creates a group of routes. A route group can apply transforms
   * to routes in bulk
   */
  public group(callback: () => void): RouteGroup {
    /*
     * Create a new group with empty set of routes
     */
    const group = new RouteGroup([])

    /*
     * See if there is any opened existing route groups. If yes, then we
     * push this new group to the old group, otherwise we push it to
     * the list of routes.
     */
    const openedGroup = this.getRecentGroup()
    if (openedGroup) {
      openedGroup.routes.push(group)
    } else {
      this.routes.push(group)
    }

    /*
     * Track the group, so that the upcoming calls inside the callback
     * can use this group
     */
    this.openedGroups.push(group)

    /*
     * Execute the callback. Now all registered routes will be
     * collected seperately from the `routes` array
     */
    callback()

    /*
     * Now the callback is over, get rid of the opened group
     */
    this.openedGroups.pop()

    return group
  }

  /**
   * Registers a route resource with conventional set of routes
   */
  public resource(resource: string, controller: string): RouteResource {
    const resourceInstance = new RouteResource(resource, controller, this.paramMatchers)
    const openedGroup = this.getRecentGroup()

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
  public shallowResource(resource: string, controller: string): RouteResource {
    const resourceInstance = new RouteResource(resource, controller, this.paramMatchers, true)
    const openedGroup = this.getRecentGroup()

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
  public on(pattern: string): BriskRoute {
    const briskRoute = new BriskRoute(pattern, this.paramMatchers)
    const openedGroup = this.getRecentGroup()

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
  public where(param: string, matcher: string | RegExp): this {
    if (typeof matcher === 'string') {
      this.paramMatchers[param] = { match: new RegExp(matcher) }
    } else if (types.isRegexp(matcher)) {
      this.paramMatchers[param] = { match: matcher }
    } else {
      this.paramMatchers[param] = matcher
    }

    return this
  }

  /**
   * Returns a flat list of routes JSON
   */
  public toJSON() {
    const lookupStoreRoutes = this.tree
    const domains = Object.keys(lookupStoreRoutes)

    return domains.reduce<{ [domain: string]: (RouteNode & { methods: string[] })[] }>(
      (result, domain) => {
        result[domain] = lookupStoreRoutes[domain].map((route) => {
          const routeJSON = this.store.tree.domains[domain][route.methods[0]].routes[route.pattern]
          return Object.assign({ methods: route.methods }, routeJSON)
        })
        return result
      },
      {}
    )
  }

  /**
   * Commit routes to the store. After this, no more
   * routes can be registered.
   */
  public commit() {
    const names: string[] = []

    toRoutesJSON(this.routes).forEach((route) => {
      /*
       * Raise error when route name is already in use. Route names have to be unique
       * to ensure that only one route is returned during lookup.
       */
      if (route.name && names.indexOf(route.name) > -1) {
        throw RouterException.duplicateRouteName(route.name)
      }

      /*
       * If route has a unique, then track the name for checking duplicates
       */
      if (route.name) {
        names.push(route.name)
      }

      /*
       * If a pre-processor is defined then pass the [[RouteNode]]
       * to it.
       */
      if (this.routeProcessor) {
        this.routeProcessor(route)
      }

      /**
       * Register the route with the lookup store
       */
      this.register(route)
      this.store.add(route)
    })

    this.routes = []
    this.paramMatchers = {}
  }

  /**
   * Find route for a given URL, method and optionally domain
   */
  public match(url: string, method: string, domain?: string): null | MatchedRoute {
    /*
     * 1. If domain is not mentioned, then we lookup for root level defined
     *    routes.
     *
     * 2. If domain is mentioned, then we check the store to see if user has registered
     *    one or more routes for that domain or not.
     *
     *    - If they have not registered any routes for the mentioned domain, it means,
     *      they don't want any special treatment for this domain, hence we search
     *      with the the root level routes. (Same as 1)
     *
     *    - Else we search within the routes of the mentioned domain.
     */
    let response: null | MatchedRoute = null
    const matchingDomain = domain ? this.store.matchDomain(domain) : []

    if (!matchingDomain.length) {
      response = this.store.match(url, method)
    } else {
      /*
       * Search within the domain
       */
      response = this.store.match(url, method, {
        storeMatch: matchingDomain,
        value: domain!,
      })
    }

    return response
  }

  /**
   * Makes url to a registered route by looking it up with the route pattern,
   * name or the controller.method
   */
  public makeUrl(
    routeIdentifier: string,
    params?: any[] | MakeUrlOptions,
    options?: MakeUrlOptions
  ): string {
    const normalizedOptions = normalizeMakeUrlOptions(params, options)
    const builder = normalizedOptions.domain
      ? this.builderForDomain(normalizedOptions.domain)
      : this.builder()

    normalizedOptions.params && builder.params(normalizedOptions.params)
    normalizedOptions.qs && builder.qs(normalizedOptions.qs)
    normalizedOptions.prefixUrl && builder.prefixUrl(normalizedOptions.prefixUrl)
    normalizedOptions.disableRouteLookup && builder.disableRouteLookup()

    return builder.make(routeIdentifier)
  }

  /**
   * Makes a signed url, which can be confirmed for it's integrity without
   * relying on any sort of backend storage.
   */
  public makeSignedUrl(
    routeIdentifier: string,
    params?: any[] | MakeSignedUrlOptions,
    options?: MakeSignedUrlOptions
  ): string {
    const normalizedOptions = normalizeMakeSignedUrlOptions(params, options)
    const builder = normalizedOptions.domain
      ? this.builderForDomain(normalizedOptions.domain)
      : this.builder()

    normalizedOptions.params && builder.params(normalizedOptions.params)
    normalizedOptions.qs && builder.qs(normalizedOptions.qs)
    normalizedOptions.prefixUrl && builder.prefixUrl(normalizedOptions.prefixUrl)
    normalizedOptions.disableRouteLookup && builder.disableRouteLookup()

    return builder.makeSigned(routeIdentifier, normalizedOptions)
  }
}
