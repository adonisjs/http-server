/**
 * @adonisjs/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../../adonis-typings/index.ts" />

import { Macroable } from 'macroable'
import {
  RouteGroupContract,
  RouteParamMatcher,
  RouteMiddlewareHandler,
} from '@ioc:Adonis/Core/Route'

import { Route } from './Route'
import { BriskRoute } from './BriskRoute'
import { RouteResource } from './Resource'
import { RouterException } from '../Exceptions/RouterException'

/**
 * Group class exposes the API to take action on a group of routes.
 * The group routes must be pre-defined using the constructor.
 */
export class RouteGroup extends Macroable implements RouteGroupContract {
  protected static macros = {}
  protected static getters = {}

  /**
   * Array of middleware registered on the group
   */
  private groupMiddleware: RouteMiddlewareHandler[] = []

  /**
   * We register the group middleware only once with the route
   * and then mutate the internal stack. This ensures that
   * group own middleware are pushed to the last, but the
   * entire group of middleware is added to the front
   * in the routes
   */
  private registeredMiddlewareWithRoute = false

  constructor(public routes: (Route | RouteResource | BriskRoute | RouteGroup)[]) {
    super()
  }

  /**
   * Invokes a given method with params on the route instance or route
   * resource instance
   */
  private invoke(
    route: Route | RouteResource | BriskRoute | RouteGroup,
    method: string,
    params: any[]
  ) {
    if (route instanceof RouteResource) {
      route.routes.forEach((child) => this.invoke(child, method, params))
      return
    }

    if (route instanceof RouteGroup) {
      route.routes.forEach((child) => this.invoke(child, method, params))
      return
    }

    if (route instanceof BriskRoute) {
      /* istanbul ignore else */
      if (route.route) {
        /*
         * Raise error when trying to prefix route name but route doesn't have
         * a name
         */
        if (method === 'as' && !route.route.name) {
          throw RouterException.cannotDefineGroupName()
        }

        route.route[method](...params)
      }
      return
    }

    /*
     * Raise error when trying to prefix route name but route doesn't have
     * a name
     */
    if (method === 'as' && !route.name) {
      throw RouterException.cannotDefineGroupName()
    }

    route[method](...params)
  }

  /**
   * Define Regex matchers for a given param for all the routes.
   *
   * @example
   * ```ts
   * Route.group(() => {
   * }).where('id', /^[0-9]+/)
   * ```
   */
  public where(param: string, matcher: RouteParamMatcher): this {
    this.routes.forEach((route) => this.invoke(route, 'where', [param, matcher]))
    return this
  }

  /**
   * Define prefix all the routes in the group.
   *
   * @example
   * ```ts
   * Route.group(() => {
   * }).prefix('v1')
   * ```
   */
  public prefix(prefix: string): this {
    this.routes.forEach((route) => this.invoke(route, 'prefix', [prefix]))
    return this
  }

  /**
   * Define domain for all the routes.
   *
   * @example
   * ```ts
   * Route.group(() => {
   * }).domain(':name.adonisjs.com')
   * ```
   */
  public domain(domain: string): this {
    this.routes.forEach((route) => this.invoke(route, 'domain', [domain]))
    return this
  }

  /**
   * Prepend name to the routes name.
   *
   * @example
   * ```ts
   * Route.group(() => {
   * }).as('version1')
   * ```
   */
  public as(name: string): this {
    this.routes.forEach((route) => this.invoke(route, 'as', [name, true]))
    return this
  }

  /**
   * Prepend an array of middleware to all routes middleware.
   *
   * @example
   * ```ts
   * Route.group(() => {
   * }).middleware(['auth'])
   * ```
   */
  public middleware(
    middleware: RouteMiddlewareHandler | RouteMiddlewareHandler[],
    prepend: boolean = false
  ): this {
    middleware = Array.isArray(middleware) ? middleware : [middleware]

    if (prepend) {
      middleware.forEach((one) => this.groupMiddleware.unshift(one))
    } else {
      middleware.forEach((one) => this.groupMiddleware.push(one))
    }

    if (!this.registeredMiddlewareWithRoute) {
      this.registeredMiddlewareWithRoute = true
      this.routes.forEach((route) => this.invoke(route, 'middleware', [this.groupMiddleware, true]))
    }

    return this
  }

  /**
   * Define namespace for all the routes inside the group.
   *
   * @example
   * ```ts
   * Route.group(() => {
   * }).namespace('App/Admin/Controllers')
   * ```
   */
  public namespace(namespace: string): this {
    this.routes.forEach((route) => this.invoke(route, 'namespace', [namespace]))
    return this
  }
}
