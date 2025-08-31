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
import type { Encryption } from '@adonisjs/encryption'
import type { Application } from '@adonisjs/application'
import { RuntimeException } from '@poppinss/utils/exception'
import type { Constructor, LazyImport } from '@poppinss/utils/types'

import debug from '../debug.ts'
import type { Qs } from '../qs.ts'
import { Route } from './route.ts'
import { RouteGroup } from './group.ts'
import { BriskRoute } from './brisk.ts'
import { RoutesStore } from './store.ts'
import { toRoutesJSON } from '../utils.ts'
import { RouteResource } from './resource.ts'
import { createUrlBuilder } from './url_builder.ts'
import { UrlBuilder } from './legacy/url_builder.ts'
import { RouteMatchers as Matchers } from './matchers.ts'
import { defineNamedMiddleware } from '../define_middleware.ts'
import { createSignedUrlBuilder } from './signed_url_builder.ts'
import { createSignedURL, createURL, parseRoute } from '../helpers.ts'
import type { MiddlewareAsClass, ParsedGlobalMiddleware } from '../types/middleware.ts'

import type {
  RouteFn,
  RouteJSON,
  MatchedRoute,
  RouteMatcher,
  RouteMatchers,
  MakeUrlOptions,
  MakeSignedUrlOptions,
  GetControllerHandlers,
} from '../types/route.ts'
import {
  type UrlFor,
  type LookupList,
  type RoutesList,
  type SignedURLOptions,
} from '../types/url_builder.ts'

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

  /**
   * The URLBuilder offers a type-safe API for creating URL for pre-registered
   * routes or the route patterns.
   *
   * We recommend using the URLBuilder over the "makeUrl" and "makeSignedUrl"
   * methods.
   */
  urlBuilder: {
    urlFor: UrlFor<RoutesList extends LookupList ? RoutesList : never>
    signedUrlFor: UrlFor<RoutesList extends LookupList ? RoutesList : never, SignedURLOptions>
  }

  /**
   * List of route references kept for lookup.
   */
  protected routes: { [domain: string]: RouteJSON[] } = {}

  /**
   * Creates a new Router instance
   * @param app - The AdonisJS application instance
   * @param encryption - Encryption service for signed URLs
   * @param qsParser - Query string parser for URL generation
   */
  constructor(app: Application<any>, encryption: Encryption, qsParser: Qs) {
    this.#app = app
    this.#encryption = encryption
    this.qs = qsParser
    this.urlBuilder = {
      urlFor: createUrlBuilder(this, this.qs.stringify),
      signedUrlFor: createSignedUrlBuilder(this, this.#encryption, this.qs.stringify),
    }
  }

  /**
   * Register route JSON payload
   */
  protected register(route: RouteJSON) {
    this.routes[route.domain] = this.routes[route.domain] || []
    this.routes[route.domain].push(route)
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
   * @param pattern - The route pattern to parse
   * @param matchers - Optional route matchers
   */
  parsePattern(pattern: string, matchers?: RouteMatchers) {
    return parseRoute(pattern, matchers)
  }

  /**
   * Define an array of middleware to use on all the routes.
   * Calling this method multiple times pushes to the
   * existing list of middleware
   * @param middleware - Array of middleware classes to apply globally
   * @returns Current Router instance for method chaining
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
   * @param collection - Object mapping middleware names to middleware classes
   * @returns Named middleware functions
   */
  named<NamedMiddleware extends Record<string, LazyImport<MiddlewareAsClass>>>(
    collection: NamedMiddleware
  ) {
    return defineNamedMiddleware<NamedMiddleware>(collection)
  }

  /**
   * Add route for a given pattern and methods
   * @param pattern - The route pattern
   * @param methods - Array of HTTP methods
   * @param handler - Route handler (function, string, or controller tuple)
   * @returns The created route instance
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
   * @param pattern - The route pattern
   * @param handler - Route handler (function, string, or controller tuple)
   * @returns The created route instance
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
   * @param pattern - The route pattern
   * @param handler - Route handler (function, string, or controller tuple)
   * @returns The created route instance
   */
  get<T extends Constructor<any>>(
    pattern: string,
    handler: string | RouteFn | [LazyImport<T> | T, GetControllerHandlers<T>?]
  ) {
    return this.route(pattern, ['GET', 'HEAD'], handler)
  }

  /**
   * Define `POST` route
   * @param pattern - The route pattern
   * @param handler - Route handler (function, string, or controller tuple)
   * @returns The created route instance
   */
  post<T extends Constructor<any>>(
    pattern: string,
    handler: string | RouteFn | [LazyImport<T> | T, GetControllerHandlers<T>?]
  ) {
    return this.route(pattern, ['POST'], handler)
  }

  /**
   * Define `PUT` route
   * @param pattern - The route pattern
   * @param handler - Route handler (function, string, or controller tuple)
   * @returns The created route instance
   */
  put<T extends Constructor<any>>(
    pattern: string,
    handler: string | RouteFn | [LazyImport<T> | T, GetControllerHandlers<T>?]
  ) {
    return this.route(pattern, ['PUT'], handler)
  }

  /**
   * Define `PATCH` route
   * @param pattern - The route pattern
   * @param handler - Route handler (function, string, or controller tuple)
   * @returns The created route instance
   */
  patch<T extends Constructor<any>>(
    pattern: string,
    handler: string | RouteFn | [LazyImport<T> | T, GetControllerHandlers<T>?]
  ) {
    return this.route(pattern, ['PATCH'], handler)
  }

  /**
   * Define `DELETE` route
   * @param pattern - The route pattern
   * @param handler - Route handler (function, string, or controller tuple)
   * @returns The created route instance
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
   * @param callback - Function that defines routes within the group
   * @returns The created route group instance
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
   * @param resource - The resource name
   * @param controller - Controller to handle the resource
   * @returns The created route resource instance
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
   * @param resource - The resource name
   * @param controller - Controller to handle the resource
   * @returns The created route resource instance
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
   * @param pattern - The route pattern
   * @returns The created brisk route instance
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
   * @param param - The parameter name to match
   * @param matcher - The matcher pattern (RegExp, string, or RouteMatcher)
   * @returns Current Router instance for method chaining
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
          `A route with name "${route.name}" already exists. It may happen when two routes use the same controller, so make sure to give explicit names to these routes`
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
      this.register(route)
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
   *
   * When "disableLegacyLookup" is set, the lookup will be performed
   * only using the route name
   * @param routeIdentifier - Route name, pattern, or controller reference
   * @param domain - Optional domain to search within
   * @param method - Optional HTTP method to filter by
   * @param disableLegacyLookup - Whether to disable legacy lookup strategies
   * @returns Found route or null if not found
   */
  find(
    routeIdentifier: string,
    domain?: string,
    method?: string,
    disableLegacyLookup?: boolean
  ): RouteJSON | null {
    /**
     * Search for route in all the domains when no domain name is
     * mentioned.
     */
    if (!domain) {
      let route: RouteJSON | null = null
      for (const routeDomain of Object.keys(this.routes)) {
        route = this.find(routeIdentifier, routeDomain, method, disableLegacyLookup)
        if (route) {
          break
        }
      }
      return route
    }

    const routes = this.routes[domain]
    if (!routes) {
      return null
    }

    const lookupByName = true

    /**
     * Pattern and controller are supported for legacy reasons. However
     * the URL builder only works with names
     */
    const lookupByPattern = !disableLegacyLookup
    const lookupByController = !disableLegacyLookup

    return (
      routes.find((route) => {
        if (method && !route.methods.includes(method)) {
          return false
        }

        if (
          (route.name === routeIdentifier && lookupByName) ||
          (route.pattern === routeIdentifier && lookupByPattern)
        ) {
          return true
        }

        if (typeof route.handler === 'function' || !lookupByController) {
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
   *
   * When "disableLegacyLookup" is set, the lookup will be performed
   * only using the route name
   * @param routeIdentifier - Route name, pattern, or controller reference
   * @param domain - Optional domain to search within
   * @param method - Optional HTTP method to filter by
   * @param disableLegacyLookup - Whether to disable legacy lookup strategies
   * @returns Found route
   * @throws Error when route is not found
   */
  findOrFail(
    routeIdentifier: string,
    domain?: string,
    method?: string,
    disableLegacyLookup?: boolean
  ): RouteJSON {
    const route = this.find(routeIdentifier, domain, method, disableLegacyLookup)
    if (!route) {
      throw new Error(`Cannot lookup route "${routeIdentifier}"`)
    }

    return route
  }

  /**
   * Check if a route exists. The identifier can be the
   * route name, controller.method name or the route pattern
   * itself.
   *
   * When "followLookupStrategy" is enabled, the lookup will be performed
   * on the basis of the lookup strategy enabled via the "lookupStrategies"
   * method. The default lookupStrategy is "name" and "pattern".
   * @param routeIdentifier - Route name, pattern, or controller reference
   * @param domain - Optional domain to search within
   * @param method - Optional HTTP method to filter by
   * @param followLookupStrategy - Whether to follow the configured lookup strategy
   * @returns True if route exists, false otherwise
   */
  has(
    routeIdentifier: string,
    domain?: string,
    method?: string,
    followLookupStrategy?: boolean
  ): boolean {
    return !!this.find(routeIdentifier, domain, method, followLookupStrategy)
  }

  /**
   * Returns a list of routes grouped by their domain names
   * @returns Object mapping domain names to route arrays
   */
  toJSON(): { [domain: string]: RouteJSON[] } {
    return this.routes
  }

  /**
   * Generates types for the URL builder. These types must
   * be written inside a file for the URL builder to
   * pick them up.
   * @param indentation - Indentation level for generated types
   * @returns Generated TypeScript types as string
   */
  generateTypes(indentation: number = 0) {
    const routesList: {
      [method: string]: {
        [identifier: string]: {
          hasRequiredParams: boolean
          params: string[]
          paramsTuple: string[]
        }
      }
    } = {}

    /**
     * Tracks a route within the routesList
     */
    function trackRoute(this: Router, route: RouteJSON, domain?: string) {
      let params: string[] = []
      let paramsTuple: string[] = []
      let hasRequiredParams: boolean = false

      /**
       * Looping over tokens to build the params object and
       * the params tuple
       */
      for (let token of route.tokens) {
        if (token.type === 1) {
          hasRequiredParams = true
          params.push(`'${token.val}': string`)
          paramsTuple.push('string')
        } else if (token.type === 3) {
          params.push(`'${token.val}'?: string`)
          paramsTuple.push('string?')
        } else if (token.type === 2) {
          hasRequiredParams = true
          params.push(`'*': string[]`)
          paramsTuple.push('...string[]')
          break
        }
      }

      route.methods.forEach((method) => {
        routesList['ALL'] = routesList['ALL'] ?? {}
        routesList[method] = routesList[method] ?? {}

        const identifiers: string[] = []

        /**
         * Tracking route by its name. In case the same route already exists, we
         * will prefix the domain to the route name to create a unique identifier.
         */
        if (route.name) {
          identifiers.push(
            domain && routesList[method][route.name] ? `${domain}@${route.name}` : route.name
          )
        }

        identifiers.forEach((identifier) => {
          routesList['ALL'][identifier] = {
            params,
            paramsTuple,
            hasRequiredParams,
          }
          routesList[method][identifier] = {
            params,
            paramsTuple,
            hasRequiredParams,
          }
        })
      })
    }

    const domains = Object.keys(this.routes).filter((domain) => domain !== 'root')

    /**
     * Create routes list for all the domains. However, the root routes should
     * be registered first so that they do not have any domain prefix in case
     * of a naming conflict.
     */
    this.routes['root']?.forEach((route) => trackRoute.bind(this)(route))
    domains.forEach((domain) =>
      this.routes[domain].forEach((route) => trackRoute.bind(this)(route, domain))
    )

    return Object.keys(routesList)
      .reduce<string[]>((result, method) => {
        result.push(`${' '.repeat(indentation)}'${method}': {`)

        Object.keys(routesList[method]).forEach((identifier) => {
          const key = `'${identifier}'`
          const { paramsTuple, hasRequiredParams, params } = routesList[method][identifier]

          const dictName = hasRequiredParams ? 'params' : 'params?'
          const tupleName = hasRequiredParams ? 'paramsTuple' : 'paramsTuple?'
          const dictValue = `{${params.join(',')}}`
          const tupleValue = `[${paramsTuple?.join(',')}]`

          const value = `{ ${tupleName}: ${tupleValue}, ${dictName}: ${dictValue} }`
          result.push(`${' '.repeat(indentation + 2)}${key}: ${value},`)
        })

        result.push(`${' '.repeat(indentation)}},`)

        return result
      }, [])
      .join('\n')
  }

  /**
   * Find route for a given URL, method and optionally domain
   * @param uri - The URI to match
   * @param method - HTTP method
   * @param shouldDecodeParam - Whether to decode parameters
   * @param hostname - Optional hostname for domain matching
   * @returns Matched route or null if no match found
   */
  match(
    uri: string,
    method: string,
    shouldDecodeParam: boolean,
    hostname?: string | null
  ): null | MatchedRoute {
    const matchingDomain = this.#store.matchDomain(hostname)

    return matchingDomain.length
      ? this.#store.match(uri, method, shouldDecodeParam, {
          tokens: matchingDomain,
          hostname: hostname!,
        })
      : this.#store.match(uri, method, shouldDecodeParam)
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
   * Instead use "@adonisjs/core/services/url_builder"
   */
  builderForDomain(domain: string) {
    return new UrlBuilder(this, domain)
  }

  /**
   * Make URL to a pre-registered route
   *
   * @deprecated
   * Instead use "@adonisjs/core/services/url_builder"
   */
  makeUrl(
    routeIdentifier: string,
    params?: any[] | Record<string, any>,
    options?: MakeUrlOptions
  ): string {
    const normalizedOptions = Object.assign({}, options)

    if (options?.disableRouteLookup) {
      return createURL(
        routeIdentifier,
        parseRoute(routeIdentifier),
        this.qs.stringify,
        params,
        options
      )
    }

    const route = this.findOrFail(routeIdentifier, normalizedOptions.domain)
    return createURL(route.name ?? route.pattern, route.tokens, this.qs.stringify, params, options)
  }

  /**
   * Makes a signed URL to a pre-registered route.
   *
   * @deprecated
   * Instead use "@adonisjs/core/services/url_builder"
   */
  makeSignedUrl(
    routeIdentifier: string,
    params?: any[] | Record<string, any>,
    options?: MakeSignedUrlOptions
  ): string {
    const normalizedOptions = Object.assign({}, options)

    if (options?.disableRouteLookup) {
      return createSignedURL(
        routeIdentifier,
        parseRoute(routeIdentifier),
        this.qs.stringify,
        this.#encryption,
        params,
        options
      )
    }

    const route = this.findOrFail(routeIdentifier, normalizedOptions.domain)
    return createSignedURL(
      route.name ?? route.pattern,
      route.tokens,
      this.qs.stringify,
      this.#encryption,
      params,
      options
    )
  }
}
