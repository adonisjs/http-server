/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import is from '@sindresorhus/is'
import type Encryption from '@adonisjs/encryption'
import { RuntimeException } from '@poppinss/utils'
import type { Application } from '@adonisjs/application'

import type { Qs } from '../qs.js'
import { Route } from './route.js'
import { RouteGroup } from './group.js'
import { BriskRoute } from './brisk.js'
import { RoutesStore } from './store.js'
import { toRoutesJSON } from '../helpers.js'
import { RouteResource } from './resource.js'
import { LookupStore } from './lookup_store/main.js'
import { RouteMatchers as Matchers } from './matchers.js'

import type { LazyImport } from '../types/base.js'
import { MiddlewareStore } from '../middleware/store.js'
import type { MiddlewareAsClass } from '../types/middleware.js'
import type {
  RouteFn,
  MatchedRoute,
  RouteMatcher,
  RouteMatchers,
  MakeUrlOptions,
  MakeSignedUrlOptions,
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
export class Router<
  NamedMiddleware extends Record<string, LazyImport<MiddlewareAsClass>> = any
> extends LookupStore {
  /**
   * Application is needed to resolve string based controller expressions
   */
  #app: Application

  /**
   * Store with tokenized routes
   */
  #store: RoutesStore = new RoutesStore()

  /**
   * Global matchers to test route params against regular expressions.
   */
  #globalMatchers: RouteMatchers = {}

  /**
   * Middleware store to be shared with the routes
   */
  #middlewareStore: MiddlewareStore<NamedMiddleware>

  /**
   * A boolean to tell the router that a group is in
   * open state right now
   */
  #openedGroups: RouteGroup[] = []

  /**
   * Collection of routes, including route resource and route
   * group. To get a flat list of routes, call `router.toJSON()`
   */
  routes: (
    | Route<NamedMiddleware>
    | RouteResource<NamedMiddleware>
    | RouteGroup<NamedMiddleware>
    | BriskRoute<NamedMiddleware>
  )[] = []

  /**
   * A flag to know if routes for explicit domains have been registered.
   * The boolean is computed after calling the "commit" method.
   */
  usingDomains: boolean = false

  /**
   * Shortcut methods for commonly used route matchers
   */
  matchers = new Matchers()

  constructor(
    app: Application,
    encryption: Encryption,
    middlewareStore: MiddlewareStore<NamedMiddleware>,
    qsParser: Qs
  ) {
    super(encryption, qsParser)
    this.#app = app
    this.#middlewareStore = middlewareStore
  }

  /**
   * Push a give router entity to the list of routes or the
   * recently opened group.
   */
  #pushToRoutes(
    entity:
      | Route<NamedMiddleware>
      | RouteResource<NamedMiddleware>
      | RouteGroup<NamedMiddleware>
      | BriskRoute<NamedMiddleware>
  ) {
    const openedGroup = this.#openedGroups[this.#openedGroups.length - 1]
    if (openedGroup) {
      openedGroup.routes.push(entity)
      return
    }

    this.routes.push(entity)
  }

  /**
   * Add route for a given pattern and methods
   */
  route(pattern: string, methods: string[], handler: string | RouteFn) {
    const route = new Route(this.#app, this.#middlewareStore, {
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
  any(pattern: string, handler: string | RouteFn) {
    return this.route(
      pattern,
      ['HEAD', 'OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      handler
    )
  }

  /**
   * Define `GET` route
   */
  get(pattern: string, handler: string | RouteFn) {
    return this.route(pattern, ['GET', 'HEAD'], handler)
  }

  /**
   * Define `POST` route
   */
  post(pattern: string, handler: string | RouteFn) {
    return this.route(pattern, ['POST'], handler)
  }

  /**
   * Define `PUT` route
   */
  put(pattern: string, handler: string | RouteFn) {
    return this.route(pattern, ['PUT'], handler)
  }

  /**
   * Define `PATCH` route
   */
  patch(pattern: string, handler: string | RouteFn) {
    return this.route(pattern, ['PATCH'], handler)
  }

  /**
   * Define `DELETE` route
   */
  delete(pattern: string, handler: string | RouteFn) {
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
    const group = new RouteGroup([], this.#middlewareStore)

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
  resource(resource: string, controller: string) {
    const resourceInstance = new RouteResource(this.#app, this.#middlewareStore, {
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
  shallowResource(resource: string, controller: string) {
    const resourceInstance = new RouteResource(this.#app, this.#middlewareStore, {
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
    const briskRoute = new BriskRoute(this.#app, this.#middlewareStore, {
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
    const routeNamesByDomain: Map<string, Set<string>> = new Map()

    toRoutesJSON(this.routes).forEach((route) => {
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
       * If route has a unique, then track the name for checking duplicates
       */
      if (route.name) {
        routeNames.add(route.name)
      }

      /**
       * Register the route with the lookup store
       */
      this.register(route)
      this.#store.add(route)
    })

    routeNamesByDomain.clear()

    this.usingDomains = this.#store.usingDomains
    this.routes = []
    this.#globalMatchers = {}
  }

  /**
   * Find route for a given URL, method and optionally domain
   */
  match(url: string, method: string, hostname?: string | null): null | MatchedRoute {
    const matchingDomain = this.#store.matchDomain(hostname)

    return matchingDomain.length
      ? this.#store.match(url, method, {
          tokens: matchingDomain,
          hostname: hostname!,
        })
      : this.#store.match(url, method)
  }

  /**
   * Make URL to a pre-registered route
   */
  makeUrl(
    routeIdentifier: string,
    params?: any[] | Record<string, any>,
    options?: MakeUrlOptions
  ): string {
    const normalizedOptions = Object.assign({}, options)

    const builder = normalizedOptions.domain
      ? this.builderForDomain(normalizedOptions.domain)
      : this.builder()

    builder.params(params)
    builder.qs(normalizedOptions.qs)

    normalizedOptions.prefixUrl && builder.prefixUrl(normalizedOptions.prefixUrl)
    normalizedOptions.disableRouteLookup && builder.disableRouteLookup()

    return builder.make(routeIdentifier)
  }

  /**
   * Makes a signed URL to a pre-registered route.
   */
  makeSignedUrl(
    routeIdentifier: string,
    params?: any[] | Record<string, any>,
    options?: MakeSignedUrlOptions
  ): string {
    const normalizedOptions = Object.assign({}, options)

    const builder = normalizedOptions.domain
      ? this.builderForDomain(normalizedOptions.domain)
      : this.builder()

    builder.params(params)
    builder.qs(normalizedOptions.qs)

    normalizedOptions.prefixUrl && builder.prefixUrl(normalizedOptions.prefixUrl)
    normalizedOptions.disableRouteLookup && builder.disableRouteLookup()

    return builder.makeSigned(routeIdentifier, normalizedOptions)
  }
}
