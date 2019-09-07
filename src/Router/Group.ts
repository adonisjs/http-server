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

/// <reference path="../../adonis-typings/index.ts" />

import { Macroable } from 'macroable'
import { Exception } from '@poppinss/utils'
import { RouteGroupContract } from '@ioc:Adonis/Core/Route'

import { Route } from './Route'
import { RouteResource } from './Resource'
import { BriskRoute } from './BriskRoute'
import { exceptionCodes } from '../helpers'

function missingRouteName () {
  return new Exception(
    'All routes inside a group must have names before calling Route.group.as',
    500,
    exceptionCodes.E_MISSING_ROUTE_NAME,
  )
}

/**
 * Group class exposes the API to take action on a group
 * of routes. The group routes must be pre-defined using
 * the constructor.
 */
export class RouteGroup extends Macroable implements RouteGroupContract {
  protected static _macros = {}
  protected static _getters = {}

  constructor (public routes: (
    Route |
    RouteResource |
    BriskRoute |
    RouteGroup
  )[]) {
    super()
  }

  /**
   * Invokes a given method with params on the route instance or route
   * resource instance
   */
  private _invoke (
    route: Route | RouteResource | BriskRoute | RouteGroup,
    method: string,
    params: any[],
  ) {
    if (route instanceof RouteResource) {
      route.routes.forEach((child) => {
        this._invoke(child, method, params)
      })
      return
    }

    if (route instanceof RouteGroup) {
      route[method](...params)
      return
    }

    if (route instanceof BriskRoute) {
      /* istanbul ignore else */
      if (route.route) {
        /**
         * Raise error when trying to prefix route name but route doesn't have
         * a name
         */
        if (method === 'as' && !route.route.name) {
          throw missingRouteName()
        }

        route.route[method](...params)
      }
      return
    }

    /**
     * Raise error when trying to prefix route name but route doesn't have
     * a name
     */
    if (method === 'as' && !route.name) {
      throw missingRouteName()
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
  public where (param: string, matcher: RegExp | string): this {
    this.routes.forEach((route) => {
      this._invoke(route, 'where', [param, matcher])
    })

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
  public prefix (prefix: string): this {
    this.routes.forEach((route) => {
      this._invoke(route, 'prefix', [prefix])
    })

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
  public domain (domain: string): this {
    this.routes.forEach((route) => {
      this._invoke(route, 'domain', [domain])
    })

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
  public as (name: string): this {
    this.routes.forEach((route) => {
      this._invoke(route, 'as', [name, true])
    })

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
  public middleware (middleware: any | any[]): this {
    this.routes.forEach((route) => {
      this._invoke(route, 'middleware', [middleware, true])
    })

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
  public namespace (namespace: string): this {
    this.routes.forEach((route) => {
      this._invoke(route, 'namespace', [namespace])
    })

    return this
  }
}
