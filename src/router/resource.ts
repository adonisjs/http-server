/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import string from '@poppinss/utils/string'
import Macroable from '@poppinss/macroable'
import type { Application } from '@adonisjs/application'
import { RuntimeException } from '@poppinss/utils/exception'
import type { Constructor, LazyImport, OneOrMore } from '@poppinss/utils/types'

import { Route } from './route.ts'
import type { ResourceActionNames, RouteMatcher, RouteMatchers } from '../types/route.ts'
import type {
  MiddlewareFn,
  ParsedNamedMiddleware,
  ParsedGlobalMiddleware,
} from '../types/middleware.ts'

/**
 * Route resource exposes the API to register multiple routes for a resource.
 */
export class RouteResource<
  ActionNames extends ResourceActionNames = ResourceActionNames,
> extends Macroable {
  /**
   * Resource identifier. Nested resources are separated
   * with a dot notation
   */
  #resource: string

  /**
   * The controller to handle resource routing requests
   */
  #controller: string | LazyImport<Constructor<any>> | Constructor<any>

  /**
   * Is it a shallow resource? Shallow resources URLs do not have parent
   * resource name and id once they can be identified with the id.
   */
  #shallow: boolean = false

  /**
   * Matchers inherited from the router
   */
  #globalMatchers: RouteMatchers

  /**
   * Reference to the AdonisJS application
   */
  #app: Application<any>

  /**
   * Middleware registered on the router
   */
  #routerMiddleware: ParsedGlobalMiddleware[]

  /**
   * Parameter names for the resources. Defaults to `id` for
   * a singular resource and `resource_id` for nested
   * resources.
   */
  #params: Record<string, string> = {}

  /**
   * Base name for the routes. We suffix action names
   * on top of the base name
   */
  #routesBaseName: string

  /**
   * A collection of routes instances that belongs to this resource
   */
  routes: Route[] = []

  /**
   * Creates a new RouteResource instance
   * @param app - The AdonisJS application instance
   * @param routerMiddleware - Array of global middleware registered on the router
   * @param options - Configuration options for the route resource
   */
  constructor(
    app: Application<any>,
    routerMiddleware: ParsedGlobalMiddleware[],
    options: {
      resource: string
      controller: string | LazyImport<Constructor<any>> | Constructor<any>
      globalMatchers: RouteMatchers
      shallow: boolean
    }
  ) {
    super()
    this.#validateResourceName(options.resource)

    this.#app = app
    this.#shallow = options.shallow
    this.#routerMiddleware = routerMiddleware
    this.#controller = options.controller
    this.#globalMatchers = options.globalMatchers
    this.#resource = this.#normalizeResourceName(options.resource)
    this.#routesBaseName = this.#getRoutesBaseName()
    this.#buildRoutes()
  }

  /**
   * Normalizes the resource name to dropping leading and trailing
   * slashes.
   */
  #normalizeResourceName(resource: string) {
    return resource.replace(/^\//, '').replace(/\/$/, '')
  }

  /**
   * Ensure resource name is not an empty string
   */
  #validateResourceName(resource: string) {
    if (!resource || resource === '/') {
      throw new RuntimeException(`Invalid resource name "${resource}"`)
    }
  }

  /**
   * Converting segments of a resource to snake case to
   * make the route name.
   */
  #getRoutesBaseName() {
    return this.#resource
      .split('.')
      .map((token) => string.snakeCase(token))
      .join('.')
  }

  /**
   * Create a new route for the given pattern, methods and controller action
   */
  #createRoute(pattern: string, methods: string[], action: ResourceActionNames) {
    const route = new Route(this.#app, this.#routerMiddleware, {
      pattern,
      methods,
      handler:
        typeof this.#controller === 'string'
          ? `${this.#controller}.${action}`
          : [this.#controller, action],
      globalMatchers: this.#globalMatchers,
    })

    route.as(`${this.#routesBaseName}.${action}`)
    this.routes.push(route)
  }

  /**
   * Returns the `resource_id` name for a given resource. The
   * resource name is converted to singular form and
   * transformed to snake case.
   *
   * photos becomes photo_id
   * users becomes user_id
   */
  #getResourceId(resource: string) {
    return `${string.snakeCase(string.singular(resource))}_id`
  }

  /**
   * Build routes for the given resource
   */
  #buildRoutes() {
    const resources = this.#resource.split('.')

    const mainResource = resources.pop()!
    this.#params[mainResource] = ':id'

    const baseURI = `${resources
      .map((resource) => {
        const paramName = `:${this.#getResourceId(resource)}`
        this.#params[resource] = paramName

        return `${resource}/${paramName}`
      })
      .join('/')}/${mainResource}`

    this.#createRoute(baseURI, ['GET', 'HEAD'], 'index')
    this.#createRoute(`${baseURI}/create`, ['GET', 'HEAD'], 'create')
    this.#createRoute(baseURI, ['POST'], 'store')
    this.#createRoute(`${this.#shallow ? mainResource : baseURI}/:id`, ['GET', 'HEAD'], 'show')
    this.#createRoute(`${this.#shallow ? mainResource : baseURI}/:id/edit`, ['GET', 'HEAD'], 'edit')
    this.#createRoute(`${this.#shallow ? mainResource : baseURI}/:id`, ['PUT', 'PATCH'], 'update')
    this.#createRoute(`${this.#shallow ? mainResource : baseURI}/:id`, ['DELETE'], 'destroy')
  }

  /**
   * Filter the routes based on their partial names
   */
  #filter(names: ActionNames | ActionNames[], inverse: boolean) {
    const actions = Array.isArray(names) ? names : [names]
    return this.routes.filter((route) => {
      const match = actions.find((name) => route.getName()!.endsWith(name))
      return inverse ? !match : match
    })
  }

  /**
   * Register only given routes and remove others
   * @param names - Array of action names to keep
   * @returns Current RouteResource instance with filtered actions
   */
  only<Name extends ActionNames>(names: Name[]): RouteResource<Name> {
    this.#filter(names, true).forEach((route) => route.markAsDeleted())
    return this
  }

  /**
   * Register all routes, except the one's defined
   * @param names - Array of action names to exclude
   * @returns Current RouteResource instance with filtered actions
   */
  except<Name extends ActionNames>(names: Name[]): RouteResource<Exclude<ActionNames, Name>> {
    this.#filter(names, false).forEach((route) => route.markAsDeleted())
    return this
  }

  /**
   * Register api only routes. The `create` and `edit` routes, which
   * are meant to show forms will not be registered
   * @returns Current RouteResource instance without create and edit actions
   */
  apiOnly(): RouteResource<Exclude<ActionNames, 'create' | 'edit'>> {
    return this.except(['create', 'edit'] as ActionNames[])
  }

  /**
   * Define matcher for params inside the resource
   * @param key - The parameter name to match
   * @param matcher - The matcher pattern (RegExp, string, or RouteMatcher)
   * @returns Current RouteResource instance for method chaining
   */
  where(key: string, matcher: RouteMatcher | string | RegExp): this {
    this.routes.forEach((route) => {
      route.where(key, matcher)
    })

    return this
  }

  /**
   * Tap into multiple routes to configure them by their name
   * @param callback - Function to configure routes
   * @returns Current RouteResource instance for method chaining
   */
  tap(callback: (route: Route) => void): this
  /**
   * Tap into multiple routes to configure them by their name
   * @param actions - Action name(s) to configure
   * @param callback - Function to configure matching routes
   * @returns Current RouteResource instance for method chaining
   */
  tap(actions: ActionNames | ActionNames[], callback: (route: Route) => void): this
  tap(
    actions: ((route: Route) => void) | ActionNames | ActionNames[],
    callback?: (route: Route) => void
  ): this {
    if (typeof actions === 'function') {
      this.routes.forEach((route) => {
        if (!route.isDeleted()) {
          actions(route)
        }
      })
      return this
    }

    this.#filter(actions, false).forEach((route) => {
      if (!route.isDeleted()) {
        callback!(route)
      }
    })
    return this
  }

  /**
   * Set the param name for a given resource
   * @param resources - Object mapping resource names to parameter names
   * @returns Current RouteResource instance for method chaining
   */
  params(resources: { [resource: string]: string }): this {
    Object.keys(resources).forEach((resource) => {
      const param = resources[resource]
      const existingParam = this.#params[resource]
      this.#params[resource] = `:${param}`

      this.routes.forEach((route) => {
        route.setPattern(
          route.getPattern().replace(`${resource}/${existingParam}`, `${resource}/:${param}`)
        )
      })
    })

    return this
  }

  /**
   * Define one or more middleware on the routes created by
   * the resource.
   *
   * Calling this method multiple times will append middleware
   * to existing list.
   * @param actions - Action name(s) or '*' for all actions
   * @param middleware - Middleware function(s) to apply
   * @returns Current RouteResource instance for method chaining
   */
  use(
    actions: ActionNames | ActionNames[] | '*',
    middleware: OneOrMore<MiddlewareFn | ParsedNamedMiddleware>
  ): this {
    if (actions === '*') {
      this.tap((route) => route.use(middleware))
    } else {
      this.tap(actions, (route) => route.use(middleware))
    }
    return this
  }

  /**
   * Alias for {@link RouteResource.use}
   * @param actions - Action name(s) or '*' for all actions
   * @param middleware - Middleware function(s) to apply
   * @returns Current RouteResource instance for method chaining
   */
  middleware(
    actions: ActionNames | ActionNames[] | '*',
    middleware: OneOrMore<MiddlewareFn | ParsedNamedMiddleware>
  ): this {
    return this.use(actions, middleware)
  }

  /**
   * Prepend name to all the routes
   * @param name - The name to prepend to all route names
   * @param normalizeName - Whether to normalize the name to snake_case
   * @returns Current RouteResource instance for method chaining
   */
  as(name: string, normalizeName: boolean = true): this {
    name = normalizeName ? string.snakeCase(name) : name
    this.routes.forEach((route) => {
      route.as(route.getName()!.replace(this.#routesBaseName, name), false)
    })

    this.#routesBaseName = name
    return this
  }
}
