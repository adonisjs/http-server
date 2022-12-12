/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Macroable } from '@poppinss/macroable'
import type { RouteMatcher, StoreRouteMiddleware } from '../types/route.js'
import type { MiddlewareFn, ParsedNamedMiddleware } from '../types/middleware.js'

import { Route } from './route.js'
import { BriskRoute } from './brisk.js'
import { RouteResource } from './resource.js'

/**
 * Group class exposes the API to take action on a group of routes.
 * The group routes must be pre-defined using the constructor.
 */
export class RouteGroup extends Macroable {
  /**
   * Array of middleware registered on the group.
   */
  #middleware: StoreRouteMiddleware[] = []

  constructor(public routes: (Route | RouteGroup | RouteResource | BriskRoute)[]) {
    super()
  }

  /**
   * Shares midldeware stack with the routes. The method is invoked recursively
   * to only register middleware with the route class and not with the
   * resource or the child group
   */
  #shareMiddlewareStackWithRoutes(route: RouteGroup | Route | RouteResource | BriskRoute) {
    if (route instanceof RouteGroup) {
      route.routes.forEach((child) => this.#shareMiddlewareStackWithRoutes(child))
      return
    }

    if (route instanceof RouteResource) {
      route.routes.forEach((child) => child.getMiddleware().unshift(this.#middleware))
      return
    }

    if (route instanceof BriskRoute) {
      route.route!.getMiddleware().unshift(this.#middleware)
      return
    }

    route.getMiddleware().unshift(this.#middleware)
  }

  /**
   * Updates the route name. The method is invoked recursively to only update
   * the name with the route class and not with the resource or the child
   * group.
   */
  #updateRouteName(route: RouteGroup | Route | RouteResource | BriskRoute, name: string) {
    if (route instanceof RouteGroup) {
      route.routes.forEach((child) => this.#updateRouteName(child, name))
      return
    }

    if (route instanceof RouteResource) {
      route.routes.forEach((child) => child.as(name, true))
      return
    }

    if (route instanceof BriskRoute) {
      route.route!.as(name, true)
      return
    }

    route.as(name, true)
  }

  /**
   * Sets prefix on the route. The method is invoked recursively to only set
   * the prefix with the route class and not with the resource or the
   * child group.
   */
  #setRoutePrefix(route: RouteGroup | Route | RouteResource | BriskRoute, prefix: string) {
    if (route instanceof RouteGroup) {
      route.routes.forEach((child) => this.#setRoutePrefix(child, prefix))
      return
    }

    if (route instanceof RouteResource) {
      route.routes.forEach((child) => child.prefix(prefix))
      return
    }

    if (route instanceof BriskRoute) {
      route.route!.prefix(prefix)
      return
    }

    route.prefix(prefix)
  }

  /**
   * Updates domain on the route. The method is invoked recursively to only update
   * the domain with the route class and not with the resource or the child
   * group.
   */
  #updateRouteDomain(route: RouteGroup | Route | RouteResource | BriskRoute, domain: string) {
    if (route instanceof RouteGroup) {
      route.routes.forEach((child) => this.#updateRouteDomain(child, domain))
      return
    }

    if (route instanceof RouteResource) {
      route.routes.forEach((child) => child.domain(domain))
      return
    }

    if (route instanceof BriskRoute) {
      route.route!.domain(domain, false)
      return
    }

    route.domain(domain, false)
  }

  /**
   * Updates matchers on the route. The method is invoked recursively to only update
   * the matchers with the route class and not with the resource or the child
   * group.
   */
  #updateRouteMatchers(
    route: RouteGroup | Route | RouteResource | BriskRoute,
    param: string,
    matcher: RouteMatcher | string | RegExp
  ) {
    if (route instanceof RouteGroup) {
      route.routes.forEach((child) => this.#updateRouteMatchers(child, param, matcher))
      return
    }

    if (route instanceof RouteResource) {
      route.routes.forEach((child) => child.where(param, matcher))
      return
    }

    if (route instanceof BriskRoute) {
      route.route!.where(param, matcher)
      return
    }

    route.where(param, matcher)
  }

  /**
   * Define route param matcher
   *
   * ```ts
   * Route.group(() => {
   * }).where('id', /^[0-9]+/)
   * ```
   */
  where(param: string, matcher: RouteMatcher | string | RegExp): this {
    this.routes.forEach((route) => this.#updateRouteMatchers(route, param, matcher))
    return this
  }

  /**
   * Define prefix all the routes in the group.
   *
   * ```ts
   * Route.group(() => {
   * }).prefix('v1')
   * ```
   */
  prefix(prefix: string): this {
    this.routes.forEach((route) => this.#setRoutePrefix(route, prefix))
    return this
  }

  /**
   * Define domain for all the routes.
   *
   * ```ts
   * Route.group(() => {
   * }).domain(':name.adonisjs.com')
   * ```
   */
  domain(domain: string): this {
    this.routes.forEach((route) => this.#updateRouteDomain(route, domain))
    return this
  }

  /**
   * Prepend name to the routes name.
   *
   * ```ts
   * Route.group(() => {
   * }).as('version1')
   * ```
   */
  as(name: string): this {
    this.routes.forEach((route) => this.#updateRouteName(route, name))
    return this
  }
  /**
   * Prepend an array of middleware to all routes middleware.
   *
   * ```ts
   * Route.group(() => {
   * }).use(middleware.auth())
   * ```
   */
  use(middleware: MiddlewareFn | ParsedNamedMiddleware): this {
    /**
     * Register middleware with children. We share the group middleware
     * array by reference, therefore have to register it only for the
     * first time.
     */
    if (!this.#middleware.length) {
      this.routes.forEach((route) => this.#shareMiddlewareStackWithRoutes(route))
    }

    this.#middleware.push(middleware)
    return this
  }

  /**
   * @alias use
   */
  middleware(middleware: MiddlewareFn | ParsedNamedMiddleware): this {
    return this.use(middleware)
  }
}
