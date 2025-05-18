/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import is from '@sindresorhus/is'
import { moduleImporter } from '@adonisjs/fold'
import { RuntimeException } from '@poppinss/utils'
import type { Encryption } from '@adonisjs/encryption'
import type { Application } from '@adonisjs/application'

import debug from '../debug.js'
import type { Qs } from '../qs.js'
import { Route } from './route.js'
import { RouteGroup } from './group.js'
import { BriskRoute } from './brisk.js'
import { RoutesStore } from './store.js'
import { RouteResource } from './resource.js'
import { E_CANNOT_LOOKUP_ROUTE } from '../errors.js'
import { UrlBuilder } from './legacy/url_builder.js'
import { RouteMatchers as Matchers } from './matchers.js'
import type { Constructor, LazyImport } from '../types/base.js'
import { defineNamedMiddleware } from '../define_middleware.js'
import { parse, createSignedURL, toRoutesJSON, createURL } from '../utils.js'
import type { MiddlewareAsClass, ParsedGlobalMiddleware } from '../types/middleware.js'

import type {
  RouteFn,
  RouteJSON,
  MatchedRoute,
  RouteMatcher,
  RouteMatchers,
  MakeUrlOptions,
  MakeSignedUrlOptions,
  GetControllerHandlers,
} from '../types/route.js'

/**
 * Router class exposes a unified API to register new routes, group them or
 * create route resources.
 *
 * ```ts
 * const router = new Router()
 *
 * router.get('/', async function () {
 *   // handle request
 * })
 * ```
 */
export class Router {
  /**
   * Flag to avoid re-comitting routes to the store
   */
  #commited: boolean = false

  /**
   * List of route references kept for lookup. The routes with the store
   * are not optimized for lookup.
   */
  #routes: { [domain: string]: RouteJSON[] } = {}

  /**
   * Application is needed to resolve string based controller expressions
   */
  #app: Application<any>

  /**
   * Store with tokenized routes
   */
  #store: RoutesStore = new RoutesStore()

  /**
   * Encryption for making signed URLs
   */
  #encryption: Encryption

  /**
   * Global matchers to test route params against regular expressions.
   */
  #globalMatchers: RouteMatchers = {}

  /**
   * Middleware store to be shared with the routes
   */
  #middleware: ParsedGlobalMiddleware[] = []

  /**
   * A boolean to tell the router that a group is in
   * open state right now
   */
  #openedGroups: RouteGroup[] = []

  /**
   * Collection of routes to be committed with the store, including
   * route resource and route group.
   */
  #routesToBeCommitted: (Route | RouteResource | RouteGroup | BriskRoute)[] = []

  /**
   * A flag to know if routes for explicit domains have been registered.
   * The boolean is computed after calling the "commit" method.
   */
  usingDomains: boolean = false

  /**
   * Shortcut methods for commonly used route matchers
   */
  matchers = new Matchers()

  /**
   * Check if routes have been committed to the store. Once
   * routes are committed, defining new set of routes will
   * have no impact
   */
  get commited() {
    return this.#commited
  }

  /**
   * Query string parser for making URLs
   */
  qs: Qs

  constructor(app: Application<any>, encryption: Encryption, qsParser: Qs) {
    this.#app = app
    this.#encryption = encryption
    this.qs = qsParser
  }

  /**
   * Register route JSON payload
   */
  #register(route: RouteJSON) {
    this.#routes[route.domain] = this.#routes[route.domain] || []
    this.#routes[route.domain].push(route)
  }

  /**
   * Push a give router entity to the list of routes or the
   * recently opened group.
   */
  #pushToRoutes(entity: Route | RouteResource | RouteGroup | BriskRoute) {
    const openedGroup = this.#openedGroups[this.#openedGroups.length - 1]
    if (openedGroup) {
      openedGroup.routes.push(entity)
      return
    }

    this.#routesToBeCommitted.push(entity)
  }

  /**
   * Parses the route pattern
   */
  parsePattern(pattern: string, matchers?: RouteMatchers) {
    return parse(pattern, matchers)
  }

  /**
   * Define an array of middleware to use on all the routes.
   * Calling this method multiple times pushes to the
   * existing list of middleware
   */
  use(middleware: LazyImport<MiddlewareAsClass>[]): this {
    middleware.forEach((one) =>
      this.#middleware.push({
        reference: one,
        ...moduleImporter(one, 'handle').toHandleMethod(),
      })
    )

    return this
  }

  /**
   * Define a collection of named middleware. The defined collection is
   * not registered anywhere, but instead converted in a new collection
   * of functions you can apply on the routes, or router groups.
   */
  named<NamedMiddleware extends Record<string, LazyImport<MiddlewareAsClass>>>(
    collection: NamedMiddleware
  ) {
    return defineNamedMiddleware<NamedMiddleware>(collection)
  }

  /**
   * Add route for a given pattern and methods
   */
  route<T extends Constructor<any>>(
    pattern: string,
    methods: string[],
    handler: string | RouteFn | [LazyImport<T> | T, GetControllerHandlers<T>?]
  ) {
    const route = new Route(this.#app, this.#middleware, {
      pattern,
      methods,
      handler,
      globalMatchers: this.#globalMatchers,
    })

    this.#pushToRoutes(route)
    return route
  }

  /**
   * Define a route that handles all common HTTP methods
   */
  any<T extends Constructor<any>>(
    pattern: string,
    handler: string | RouteFn | [LazyImport<T> | T, GetControllerHandlers<T>?]
  ) {
    return this.route(
      pattern,
      ['HEAD', 'OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      handler
    )
  }

  /**
   * Define `GET` route
   */
  get<T extends Constructor<any>>(
    pattern: string,
    handler: string | RouteFn | [LazyImport<T> | T, GetControllerHandlers<T>?]
  ) {
    return this.route(pattern, ['GET', 'HEAD'], handler)
  }

  /**
   * Define `POST` route
   */
  post<T extends Constructor<any>>(
    pattern: string,
    handler: string | RouteFn | [LazyImport<T> | T, GetControllerHandlers<T>?]
  ) {
    return this.route(pattern, ['POST'], handler)
  }

  /**
   * Define `PUT` route
   */
  put<T extends Constructor<any>>(
    pattern: string,
    handler: string | RouteFn | [LazyImport<T> | T, GetControllerHandlers<T>?]
  ) {
    return this.route(pattern, ['PUT'], handler)
  }

  /**
   * Define `PATCH` route
   */
  patch<T extends Constructor<any>>(
    pattern: string,
    handler: string | RouteFn | [LazyImport<T> | T, GetControllerHandlers<T>?]
  ) {
    return this.route(pattern, ['PATCH'], handler)
  }

  /**
   * Define `DELETE` route
   */
  delete<T extends Constructor<any>>(
    pattern: string,
    handler: string | RouteFn | [LazyImport<T> | T, GetControllerHandlers<T>?]
  ) {
    return this.route(pattern, ['DELETE'], handler)
  }

  /**
   * Creates a group of routes. A route group can apply transforms
   * to routes in bulk
   */
  group(callback: () => void) {
    /*
     * Create a new group with empty set of routes
     */
    const group = new RouteGroup([])

    /**
     * Track group
     */
    this.#pushToRoutes(group)

    /*
     * Track the group, so that the upcoming calls inside the callback
     * can use this group
     */
    this.#openedGroups.push(group)

    /*
     * Execute the callback. Now all registered routes will be
     * collected seperately from the `routes` array
     */
    callback()

    /*
     * Now the callback is over, get rid of the opened group
     */
    this.#openedGroups.pop()

    return group
  }

  /**
   * Registers a route resource with conventional set of routes
   */
  resource(resource: string, controller: string | LazyImport<Constructor<any>> | Constructor<any>) {
    const resourceInstance = new RouteResource(this.#app, this.#middleware, {
      resource,
      controller,
      shallow: false,
      globalMatchers: this.#globalMatchers,
    })

    this.#pushToRoutes(resourceInstance)
    return resourceInstance
  }

  /**
   * Register a route resource with shallow nested routes.
   */
  shallowResource(
    resource: string,
    controller: string | LazyImport<Constructor<any>> | Constructor<any>
  ) {
    const resourceInstance = new RouteResource(this.#app, this.#middleware, {
      resource,
      controller,
      shallow: true,
      globalMatchers: this.#globalMatchers,
    })

    this.#pushToRoutes(resourceInstance)
    return resourceInstance
  }

  /**
   * Returns a brisk route instance for a given URL pattern
   */
  on(pattern: string) {
    const briskRoute = new BriskRoute(this.#app, this.#middleware, {
      pattern,
      globalMatchers: this.#globalMatchers,
    })

    this.#pushToRoutes(briskRoute)
    return briskRoute
  }

  /**
   * Define matcher for a given param. The global params are applied
   * on all the routes (unless overridden at the route level).
   */
  where(param: string, matcher: RouteMatcher | string | RegExp): this {
    if (typeof matcher === 'string') {
      this.#globalMatchers[param] = { match: new RegExp(matcher) }
    } else if (is.regExp(matcher)) {
      this.#globalMatchers[param] = { match: matcher }
    } else {
      this.#globalMatchers[param] = matcher
    }

    return this
  }

  /**
   * Commit routes to the store. The router is freezed after the
   * commit method is called.
   */
  commit() {
    if (this.#commited) {
      return
    }

    debug('Committing routes to the routes store')
    const routeNamesByDomain: Map<string, Set<string>> = new Map()

    toRoutesJSON(this.#routesToBeCommitted).forEach((route) => {
      if (!routeNamesByDomain.has(route.domain)) {
        routeNamesByDomain.set(route.domain, new Set())
      }

      const routeNames = routeNamesByDomain.get(route.domain)!

      /*
       * Raise error when route name is already in use. Route names have to be unique
       * to ensure that only one route is returned during lookup.
       */
      if (route.name && routeNames.has(route.name)) {
        throw new RuntimeException(
          `Route with duplicate name found. A route with name "${route.name}" already exists`
        )
      }

      /*
       * If route has a unique name, then track the name for checking duplicates
       */
      if (route.name) {
        routeNames.add(route.name)
      }

      /**
       * Register the route with the lookup store
       */
      this.#register(route)
      this.#store.add(route)
    })

    routeNamesByDomain.clear()

    this.usingDomains = this.#store.usingDomains
    this.#routesToBeCommitted = []
    this.#globalMatchers = {}
    this.#middleware = []
    this.#openedGroups = []
    this.#commited = true
  }

  /**
   * Finds a route by its identifier. The identifier can be the
   * route name, controller.method name or the route pattern
   * itself.
   */
  find(routeIdentifier: string, domain?: string): RouteJSON | null {
    /**
     * Search for route in all the domains when no domain name is
     * mentioned.
     */
    if (!domain) {
      let route: RouteJSON | null = null
      for (const routeDomain of Object.keys(this.#routes)) {
        route = this.find(routeIdentifier, routeDomain)
        if (route) {
          break
        }
      }
      return route
    }

    const routes = this.#routes[domain]
    if (!routes) {
      return null
    }

    return (
      routes.find((route) => {
        if (route.name === routeIdentifier || route.pattern === routeIdentifier) {
          return true
        }

        if (typeof route.handler === 'function') {
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
   */
  findOrFail(routeIdentifier: string, domain?: string): RouteJSON {
    const route = this.find(routeIdentifier, domain)
    if (!route) {
      throw new E_CANNOT_LOOKUP_ROUTE([routeIdentifier])
    }

    return route
  }

  /**
   * Check if a route exists. The identifier can be the
   * route name, controller.method name or the route pattern
   * itself.
   */
  has(routeIdentifier: string, domain?: string): boolean {
    return !!this.find(routeIdentifier, domain)
  }

  /**
   * Returns a list of routes grouped by their domain names
   */
  toJSON(): { [domain: string]: RouteJSON[] } {
    return this.#routes
  }

  /**
   * Find route for a given URL, method and optionally domain
   */
  match(uri: string, method: string, hostname?: string | null): null | MatchedRoute {
    const matchingDomain = this.#store.matchDomain(hostname)

    return matchingDomain.length
      ? this.#store.match(uri, method, {
          tokens: matchingDomain,
          hostname: hostname!,
        })
      : this.#store.match(uri, method)
  }

  /**
   * Create URL builder instance.
   * @deprecated
   *
   * Instead use "@adonisjs/core/services/url_builder" instead
   */
  builder() {
    return new UrlBuilder(this)
  }

  /**
   * Create URL builder instance for a given domain.
   * @deprecated
   *
   * Instead use "@adonisjs/core/services/url_builder" instead
   */
  builderForDomain(domain: string) {
    return new UrlBuilder(this, domain)
  }

  /**
   * Make URL to a pre-registered route
   *
   * @deprecated
   * Instead use "@adonisjs/core/services/url_builder" instead
   */
  makeUrl(
    routeIdentifier: string,
    params?: any[] | Record<string, any>,
    options?: MakeUrlOptions
  ): string {
    const normalizedOptions = Object.assign({}, options)

    if (options?.disableRouteLookup) {
      return createURL(routeIdentifier, this.qs, params, options)
    }

    const route = this.findOrFail(routeIdentifier, normalizedOptions.domain)
    return createURL(route, this.qs, params, options)
  }

  /**
   * Makes a signed URL to a pre-registered route.
   *
   * @deprecated
   * Instead use "@adonisjs/core/services/url_builder" instead
   */
  makeSignedUrl(
    routeIdentifier: string,
    params?: any[] | Record<string, any>,
    options?: MakeSignedUrlOptions
  ): string {
    const normalizedOptions = Object.assign({}, options)

    if (options?.disableRouteLookup) {
      return createSignedURL(routeIdentifier, this.qs, this.#encryption, params, options)
    }

    const route = this.findOrFail(routeIdentifier, normalizedOptions.domain)
    return createSignedURL(route, this.qs, this.#encryption, params, options)
  }
}
