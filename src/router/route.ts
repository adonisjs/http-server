/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import is from '@sindresorhus/is'
import Macroable from '@poppinss/macroable'
import Middleware from '@poppinss/middleware'
import type { Application } from '@adonisjs/application'
import { RuntimeException } from '@poppinss/utils/exception'
import { moduleCaller, moduleImporter } from '@adonisjs/fold'
import type { Constructor, LazyImport, OneOrMore } from '@poppinss/utils/types'

import debug from '../debug.ts'
import { execute } from './executor.ts'
import { dropSlash } from '../utils.ts'
import { parseRoute } from '../helpers.ts'

import type {
  MiddlewareFn,
  ParsedNamedMiddleware,
  ParsedGlobalMiddleware,
} from '../types/middleware.ts'

import type {
  RouteFn,
  RouteJSON,
  RouteMatcher,
  RouteMatchers,
  StoreRouteHandler,
  StoreRouteMiddleware,
  GetControllerHandlers,
} from '../types/route.ts'
import StringBuilder from '@poppinss/utils/string_builder'
import string from '@poppinss/utils/string'

/**
 * The Route class provides a fluent API for constructing and configuring HTTP routes.
 *
 * Routes define how HTTP requests are handled by mapping URL patterns and HTTP methods
 * to controller actions or inline handlers. This class supports middleware application,
 * parameter validation, naming, and various other route-specific configurations.
 *
 * @example
 * ```ts
 * const route = new Route(app, middleware, {
 *   pattern: '/users/:id',
 *   methods: ['GET'],
 *   handler: 'UsersController.show'
 * })
 *
 * route
 *   .where('id', /^[0-9]+$/)
 *   .middleware(['auth'])
 *   .as('users.show')
 * ```
 */
export class Route<Controller extends Constructor<any> = any> extends Macroable {
  /**
   * The URL pattern for this route. May contain dynamic parameters
   * prefixed with a colon (e.g., '/users/:id').
   */
  #pattern: string

  /**
   * Array of HTTP methods this route responds to (e.g., ['GET', 'POST']).
   */
  #methods: string[]

  /**
   * A unique identifier for the route, used for URL generation and
   * route referencing.
   */
  #name?: string

  /**
   * Flag indicating whether the route should be excluded from registration
   * in the route store. This must be set before calling Router.commit().
   */
  #isDeleted: boolean = false

  /**
   * The handler function or controller method that processes requests
   * matching this route.
   */
  #handler: StoreRouteHandler

  /**
   * Route parameter matchers inherited from the global router configuration.
   * These are applied to all routes unless overridden locally.
   */
  #globalMatchers: RouteMatchers

  /**
   * Reference to the AdonisJS application instance, used for module
   * resolution and dependency injection.
   */
  #app: Application<any>

  /**
   * Global middleware registered on the router that applies to this route.
   */
  #routerMiddleware: ParsedGlobalMiddleware[]

  /**
   * The domain this route belongs to. Defaults to 'root' when no specific
   * domain is configured.
   */
  #routeDomain: string = 'root'

  /**
   * Route-specific parameter matchers that validate dynamic segments.
   * Populated via the where() method and takes precedence over global matchers.
   */
  #matchers: RouteMatchers = {}

  /**
   * Stack of URL prefixes applied to this route, typically inherited from
   * route groups. Prefixes are applied in reverse order during pattern computation.
   */
  #prefixes: string[] = []

  /**
   * Multi-dimensional array of middleware, where each nested array represents
   * a layer in the middleware stack. This structure maintains the order of
   * middleware application from groups and direct assignments.
   */
  #middleware: StoreRouteMiddleware[][] = []

  /**
   * Creates a new Route instance
   * @param app - The AdonisJS application instance
   * @param routerMiddleware - Array of global middleware registered on the router
   * @param options - Configuration options for the route
   */
  constructor(
    app: Application<any>,
    routerMiddleware: ParsedGlobalMiddleware[],
    options: {
      pattern: string
      methods: string[]
      handler:
        RouteFn | string | [LazyImport<Controller> | Controller, GetControllerHandlers<Controller>?]
      globalMatchers: RouteMatchers
    }
  ) {
    super()
    this.#app = app
    this.#routerMiddleware = routerMiddleware
    this.#pattern = options.pattern
    this.#methods = options.methods
    this.#globalMatchers = options.globalMatchers

    const { handler, routeName } = this.#resolveRouteHandle(options.handler)
    this.#handler = handler
    this.#name = routeName
  }

  /**
   * Resolves the route handler from various input formats into a normalized
   * StoreRouteHandler object. Supports string references, inline functions,
   * class constructors, and lazy imports.
   *
   * @param handler - The handler in one of the supported formats:
   *   - String: 'Controller.method' or 'Controller' (defaults to 'handle')
   *   - Function: Inline route handler function
   *   - Tuple: [Controller class or lazy import, optional method name]
   */
  #resolveRouteHandle(
    handler:
      RouteFn | string | [LazyImport<Controller> | Controller, GetControllerHandlers<Controller>?]
  ) {
    /**
     * Convert magic string to handle method call
     */
    if (typeof handler === 'string') {
      const parts = handler.split('.')
      const method = parts.length === 1 ? 'handle' : parts.pop()!
      const moduleRefId = parts.join('.')
      const controllerName = new StringBuilder(moduleRefId.split('/').pop()!)
        .removeSuffix('controller')
        .snakeCase()

      return {
        handler: {
          method,
          reference: handler,
          importExpression: moduleRefId,
          ...moduleImporter(() => this.#app.import(moduleRefId), method).toHandleMethod(),
          name: handler,
        } satisfies StoreRouteHandler,
        routeName:
          method === 'handle'
            ? controllerName.toString()
            : `${controllerName}.${string.snakeCase(method)}`,
      }
    }

    /**
     * Using a lazily imported controller
     */
    if (Array.isArray(handler)) {
      const controller = handler[0]
      const method = (handler[1] as string) ?? 'handle'

      /**
       * The first item of the tuple is a class constructor
       */
      if (is.class(controller)) {
        const controllerName = new StringBuilder(controller.name)
          .removeSuffix('controller')
          .snakeCase()

        return {
          handler: {
            method,
            reference: handler,
            importExpression: null,
            ...moduleCaller(controller, method).toHandleMethod(),
          } satisfies StoreRouteHandler,
          routeName:
            method === 'handle'
              ? controllerName.toString()
              : `${controllerName}.${string.snakeCase(method)}`,
        }
      }

      const controllerName = controller.name
        ? new StringBuilder(controller.name).removeSuffix('controller').snakeCase()
        : undefined

      /**
       * The first item of the tuple is a function that lazily
       * loads the controller
       */
      return {
        handler: {
          method,
          reference: handler,
          importExpression: String(controller),
          ...moduleImporter(controller, method).toHandleMethod(),
        } satisfies StoreRouteHandler,
        routeName: controllerName
          ? method === 'handle'
            ? controllerName.toString()
            : `${controllerName}.${string.snakeCase(method)}`
          : undefined,
      }
    }

    return { handler }
  }

  /**
   * Merges global and route-specific parameter matchers into a single object.
   * Local matchers take precedence over global matchers when conflicts occur.
   */
  #getMatchers() {
    return { ...this.#globalMatchers, ...this.#matchers }
  }

  /**
   * Computes the final route pattern by applying all prefixes from route groups.
   * Prefixes are applied in reverse order (innermost group first) and normalized
   * to remove leading/trailing slashes.
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
   * Returns the route's handler configuration object.
   */
  getHandler(): StoreRouteHandler {
    return this.#handler
  }

  /**
   * Defines a validation matcher for a route parameter. Route-level matchers
   * take precedence over group-level matchers to ensure routes can override
   * group constraints.
   *
   * @param param - The name of the route parameter to validate
   * @param matcher - The validation pattern as a string, RegExp, or RouteMatcher object
   *
   * @example
   * ```ts
   * // Validate that 'id' is numeric
   * route.where('id', /^[0-9]+$/)
   *
   * // Using a string pattern
   * route.where('slug', '[a-z0-9-]+')
   *
   * // Route matcher takes precedence over group matcher
   * Route.group(() => {
   *   Route.get('/:id', 'handler').where('id', /^[0-9]$/)
   * }).where('id', /[^a-z$]/)
   * // The route's /^[0-9]$/ wins over the group's matcher
   * ```
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
   * Adds a URL prefix to the route pattern. Multiple calls stack prefixes
   * which are applied in reverse order during pattern computation.
   *
   * @param prefix - The URL prefix to prepend to the route pattern
   *
   * @example
   * ```ts
   * route.prefix('/api').prefix('/v1')
   * // Results in pattern: /v1/api/users (for original pattern /users)
   * ```
   */
  prefix(prefix: string): this {
    this.#prefixes.push(prefix)
    return this
  }

  /**
   * Assigns a custom domain to the route. By default, routes belong to the
   * 'root' domain. Once set, the domain is not overwritten unless the
   * overwrite flag is true.
   *
   * @param domain - The domain identifier for this route
   * @param overwrite - Whether to overwrite an existing non-root domain
   *
   * @example
   * ```ts
   * route.domain('api.example.com')
   *
   * // Overwrite existing domain
   * route.domain('new.example.com', true)
   * ```
   */
  domain(domain: string, overwrite: boolean = false): this {
    if (this.#routeDomain === 'root' || overwrite) {
      this.#routeDomain = domain
    }
    return this
  }

  /**
   * Registers one or more middleware to execute before the route handler.
   * Middleware can be inline functions or named middleware references registered
   * with the router's middleware store.
   *
   * @param middleware - Single middleware or array of middleware to apply
   *
   * @example
   * ```ts
   * // Single middleware
   * route.use(async (ctx, next) => {
   *   console.log('Before handler')
   *   await next()
   * })
   *
   * // Multiple middleware
   * route.use(['auth', 'admin'])
   * ```
   */
  use(middleware: OneOrMore<MiddlewareFn | ParsedNamedMiddleware>): this {
    this.#middleware.push(Array.isArray(middleware) ? middleware : [middleware])
    return this
  }

  /**
   * Alias for the {@link Route.use} method.
   *
   * @param middleware - Single middleware or array of middleware to apply
   */
  middleware(middleware: OneOrMore<MiddlewareFn | ParsedNamedMiddleware>): this {
    return this.use(middleware)
  }

  /**
   * Assigns a unique name to the route for use in URL generation and route
   * referencing. Assigning a new name replaces any existing name unless
   * prepend is true.
   *
   * @param name - The route name to assign
   * @param prepend - If true, prepends the name to the existing name with a dot separator
   *
   * @example
   * ```ts
   * // Set route name
   * route.as('users.show')
   *
   * // Prepend to existing name (typically used by route groups)
   * route.as('admin', true) // Results in 'admin.users.show'
   * ```
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
   * Checks whether the route has been marked for deletion. Deleted routes
   * are excluded from the route store during registration.
   */
  isDeleted(): boolean {
    return this.#isDeleted
  }

  /**
   * Marks the route for deletion. Deleted routes will not be registered
   * with the route store when Router.commit() is called.
   *
   * @example
   * ```ts
   * const route = Route.get('/admin', 'handler')
   * route.markAsDeleted()
   * // This route will not be registered
   * ```
   */
  markAsDeleted() {
    this.#isDeleted = true
  }

  /**
   * Returns the unique name assigned to the route, if any.
   */
  getName(): string | undefined {
    return this.#name
  }

  /**
   * Returns the route's URL pattern with dynamic parameters.
   */
  getPattern(): string {
    return this.#pattern
  }

  /**
   * Updates the route's URL pattern.
   *
   * @param pattern - The new URL pattern to assign to the route
   *
   * @example
   * ```ts
   * route.setPattern('/users/:id/posts/:postId')
   * ```
   */
  setPattern(pattern: string): this {
    this.#pattern = pattern
    return this
  }

  /**
   * Returns the multi-dimensional middleware stack registered on this route.
   * The returned value is shared by reference, not a copy.
   */
  getMiddleware() {
    return this.#middleware
  }

  /**
   * Constructs a frozen Middleware instance for storage. This combines global
   * router middleware with route-specific middleware in the correct execution order.
   * The middleware is frozen to prevent modifications after route registration.
   */
  #getMiddlewareForStore() {
    const middleware = new Middleware<StoreRouteMiddleware>()

    this.#routerMiddleware.forEach((one) => {
      debug('adding global middleware to route %s, %O', this.#pattern, one)
      middleware.add(one)
    })
    this.#middleware.flat().forEach((one) => {
      debug('adding named middleware to route %s, %O', this.#pattern, one)
      middleware.add(one)
    })

    middleware.freeze()
    return middleware
  }

  /**
   * Serializes the route into a JSON representation suitable for storage and
   * execution. This includes the computed pattern with prefixes, merged matchers,
   * parsed route tokens, and frozen middleware stack.
   *
   * @example
   * ```ts
   * const json = route.toJSON()
   * console.log(json.pattern) // '/api/users/:id'
   * console.log(json.methods) // ['GET']
   * console.log(json.name) // 'users.show'
   * ```
   */
  toJSON(): RouteJSON {
    const pattern = this.#computePattern()
    const matchers = this.#getMatchers()

    return {
      domain: this.#routeDomain,
      pattern,
      matchers,
      tokens: parseRoute(pattern, matchers),
      meta: {},
      name: this.#name,
      handler: this.#handler,
      methods: this.#methods,
      middleware: this.#getMiddlewareForStore(),
      execute: execute,
    }
  }
}
