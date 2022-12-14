/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import is from '@sindresorhus/is'
import Middleware from '@poppinss/middleware'
import { Macroable } from '@poppinss/macroable'
import { RuntimeException } from '@poppinss/utils'
import type { Application } from '@adonisjs/application'
import { moduleCaller, moduleExpression, moduleImporter } from '@adonisjs/fold'

import { execute } from './executor.js'
import { dropSlash } from '../helpers.js'
import type { Constructor, LazyImport } from '../types/base.js'

import type {
  MiddlewareFn,
  ParsedNamedMiddleware,
  ParsedGlobalMiddleware,
} from '../types/middleware.js'

import type {
  GetControllerHandlers,
  RouteFn,
  RouteJSON,
  RouteMatcher,
  RouteMatchers,
  StoreRouteHandler,
  StoreRouteMiddleware,
} from '../types/route.js'

/**
 * The route class exposes the APIs for constructing a route using the
 * fluent API.
 */
export class Route<Controller extends Constructor<any> = any> extends Macroable {
  /**
   * Route pattern
   */
  #pattern: string

  /**
   * HTTP Methods for the route
   */
  #methods: string[]

  /**
   * A unique name for the route
   */
  #name?: string

  /**
   * A boolean to prevent route from getting registered within
   * the store.
   *
   * This flag must be set before "Router.commit" method
   */
  #isDeleted: boolean = false

  /**
   * Route handler
   */
  #handler: StoreRouteHandler

  /**
   * Matchers inherited from the router
   */
  #globalMatchers: RouteMatchers

  /**
   * Reference to the AdonisJS application
   */
  #app: Application<any, any>

  /**
   * Middleware registered on the router
   */
  #routerMiddleware: ParsedGlobalMiddleware[]

  /**
   * By default the route is part of the `root` domain. Root domain is used
   * when no domain is defined
   */
  #routeDomain: string = 'root'

  /**
   * An object of matchers to be forwarded to the store. The matchers
   * list is populated by calling `where` method
   */
  #matchers: RouteMatchers = {}

  /**
   * Custom prefixes defined on the route or the route parent
   * groups
   */
  #prefixes: string[] = []

  /**
   * Middleware defined directly on the route or the route parent
   * routes. We mantain an array for each layer of the stack
   */
  #middleware: StoreRouteMiddleware[][] = []

  constructor(
    app: Application<any, any>,
    routerMiddleware: ParsedGlobalMiddleware[],
    options: {
      pattern: string
      methods: string[]
      handler:
        | RouteFn
        | string
        | [LazyImport<Controller> | Controller, GetControllerHandlers<Controller>?]
      globalMatchers: RouteMatchers
    }
  ) {
    super()
    this.#app = app
    this.#routerMiddleware = routerMiddleware
    this.#pattern = options.pattern
    this.#methods = options.methods
    this.#handler = this.#resolveRouteHandle(options.handler)
    this.#globalMatchers = options.globalMatchers
  }

  /**
   * Resolves the route handler string expression to a
   * handler method object
   */
  #resolveRouteHandle(
    handler:
      | RouteFn
      | string
      | [LazyImport<Controller> | Controller, GetControllerHandlers<Controller>?]
  ) {
    if (typeof handler === 'string') {
      return {
        reference: handler,
        ...moduleExpression(handler, this.#app.appRoot).toHandleMethod(),
      }
    }

    /**
     * Using a lazily imported controller
     */
    if (Array.isArray(handler)) {
      /**
       * The first item of the tuple is a class constructor
       */
      if (is.class_(handler[0])) {
        return {
          reference: handler[0].name,
          ...moduleCaller(handler[0], (handler[1] || 'handle') as string).toHandleMethod(),
        }
      }

      /**
       * The first item of the tuple is a function that lazily
       * loads the controller
       */
      return {
        reference: handler[0].name,
        ...moduleImporter(handler[0], (handler[1] || 'handle') as string).toHandleMethod(),
      }
    }

    return handler
  }

  /**
   * Returns an object of param matchers by merging global and local
   * matchers. The local copy is given preference over the global
   * one's
   */
  #getMatchers() {
    return { ...this.#globalMatchers, ...this.#matchers }
  }

  /**
   * Returns a normalized pattern string by prefixing the `prefix` (if defined).
   */
  #computePattern(): string {
    const pattern = dropSlash(this.#pattern)
    const prefix = this.#prefixes
      .slice()
      .reverse()
      .map((one) => dropSlash(one))
      .join('')

    return prefix ? `${prefix}${pattern === '/' ? '' : pattern}` : pattern
  }

  /**
   * Define matcher for a given param. If a matcher exists, then we do not
   * override that, since the routes inside a group will set matchers
   * before the group, so they should have priority over the group
   * matchers.
   *
   * ```ts
   * Route.group(() => {
   *   Route.get('/:id', 'handler').where('id', /^[0-9]$/)
   * }).where('id', /[^a-z$]/)
   * ```
   *
   * The `/^[0-9]$/` will win over the matcher defined by the group
   */
  where(param: string, matcher: RouteMatcher | string | RegExp): this {
    if (this.#matchers[param]) {
      return this
    }

    if (typeof matcher === 'string') {
      this.#matchers[param] = { match: new RegExp(matcher) }
    } else if (is.regExp(matcher)) {
      this.#matchers[param] = { match: matcher }
    } else {
      this.#matchers[param] = matcher
    }

    return this
  }

  /**
   * Define prefix for the route. Calling this method multiple times
   * applies multiple prefixes in the reverse order.
   */
  prefix(prefix: string): this {
    this.#prefixes.push(prefix)
    return this
  }

  /**
   * Define a custom domain for the route. We do not overwrite the domain
   * unless `overwrite` flag is set to true.
   */
  domain(domain: string, overwrite: boolean = false): this {
    if (this.#routeDomain === 'root' || overwrite) {
      this.#routeDomain = domain
    }
    return this
  }

  /**
   * Define one or more middleware to be executed before the route
   * handler.
   *
   * Named middleware can be referenced using the name registered with
   * the router middleware store.
   */
  use(middleware: MiddlewareFn | ParsedNamedMiddleware): this {
    this.#middleware.push([middleware])
    return this
  }

  /**
   * @alias use
   */
  middleware(middleware: MiddlewareFn | ParsedNamedMiddleware): this {
    return this.use(middleware)
  }

  /**
   * Give a unique name to the route. Assinging a new unique removes the
   * existing name of the route.
   *
   * Setting prepends to true prefixes the name to the existing name.
   */
  as(name: string, prepend = false): this {
    if (prepend) {
      if (!this.#name) {
        throw new RuntimeException(
          `Routes inside a group must have names before calling "router.group.as"`
        )
      }

      this.#name = `${name}.${this.#name}`
      return this
    }

    this.#name = name
    return this
  }

  /**
   * Check if the route was marked to be deleted
   */
  isDeleted(): boolean {
    return this.#isDeleted
  }

  /**
   * Mark route as deleted. Deleted routes are not registered
   * with the route store
   */
  markAsDeleted() {
    this.#isDeleted = true
  }

  /**
   * Get the route name
   */
  getName(): string | undefined {
    return this.#name
  }

  /**
   * Get the route pattern
   */
  getPattern(): string {
    return this.#pattern
  }

  /**
   * Set the route pattern
   */
  setPattern(pattern: string): this {
    this.#pattern = pattern
    return this
  }

  /**
   * Returns the stack of middleware registered on the route.
   * The value is shared by reference.
   */
  getMiddleware() {
    return this.#middleware
  }

  /**
   * Returns the middleware instance for persistence inside the
   * store
   */
  #getMiddlewareForStore() {
    const middleware = new Middleware<StoreRouteMiddleware>()

    this.#routerMiddleware.forEach((one) => middleware.add(one))
    this.#middleware.flat().forEach((one) => middleware.add(one))

    return middleware
  }

  /**
   * Returns JSON representation of the route
   */
  toJSON(): RouteJSON {
    return {
      domain: this.#routeDomain,
      pattern: this.#computePattern(),
      matchers: this.#getMatchers(),
      meta: {},
      name: this.#name,
      handler: this.#handler,
      methods: this.#methods,
      middleware: this.#getMiddlewareForStore(),
      execute: execute,
    }
  }
}
