/**
 * @module @adonisjs/http-server
 */

/*
* @adonisjs/http-server
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

/// <reference path="../../adonis-typings/index.ts" />

import { singular } from 'pluralize'
import { Macroable } from 'macroable'
import { snakeCase } from 'lodash'

import { MiddlewareNode } from '@ioc:Adonis/Core/Middleware'
import { RouteMatchers, RouteResourceContract } from '@ioc:Adonis/Core/Route'

import { Route } from './Route'

/**
 * Resource route helps in defining multiple conventional routes. The support
 * for shallow routes makes it super easy to avoid deeply nested routes.
 * Learn more http://weblog.jamisbuck.org/2007/2/5/nesting-resources.
 *
 * @example
 * ```ts
 * const resource = new RouteResource('articles', 'ArticlesController')
 * ```
 */
export class RouteResource extends Macroable implements RouteResourceContract {
  protected static macros = {}
  protected static getters = {}

  /**
   * A copy of routes that belongs to this resource
   */
  public routes: Route[] = []

  /**
   * Resource name
   */
  private _resourceName: string = this._resource.
    split('.')
    .map((token) => snakeCase(token)).join('.')

  constructor (
    private _resource: string,
    private _controller: string,
    private _globalMatchers: RouteMatchers,
    private _shallow = false,
  ) {
    super()
    this._buildRoutes()
  }

  /**
   * Add a new route for the given pattern, methods and controller action
   */
  private _makeRoute (pattern: string, methods: string[], action: string) {
    const route = new Route(
      pattern,
      methods,
      `${this._controller}.${action}`,
      this._globalMatchers,
    )

    route.as(`${this._resourceName}.${action}`)
    this.routes.push(route)
  }

  /**
   * Build routes for the given resource
   */
  private _buildRoutes () {
    this._resource = this._resource.replace(/^\//, '').replace(/\/$/, '')

    const resourceTokens = this._resource.split('.')
    const mainResource = resourceTokens.pop()!

    const fullUrl = `${resourceTokens
      .map((token) => {
        return `${token}/:${snakeCase(singular(token))}_id`
      })
      .join('/')}/${mainResource}`

    const shallowUrl = this._shallow ? mainResource : fullUrl

    this._makeRoute(fullUrl, ['GET'], 'index')
    this._makeRoute(`${fullUrl}/create`, ['GET'], 'create')
    this._makeRoute(fullUrl, ['POST'], 'store')
    this._makeRoute(`${shallowUrl}/:id`, ['GET'], 'show')
    this._makeRoute(`${shallowUrl}/:id/edit`, ['GET'], 'edit')
    this._makeRoute(`${shallowUrl}/:id`, ['PUT', 'PATCH'], 'update')
    this._makeRoute(`${shallowUrl}/:id`, ['DELETE'], 'destroy')
  }

  /**
   * Filter the routes based on their partial names
   */
  private _filter (names: string[], inverse: boolean) {
    return this.routes.filter((route) => {
      const match = names.find((name) => route.name.endsWith(name))
      return inverse ? !match : match
    })
  }

  /**
   * Register only given routes and remove others
   */
  public only (names: string[]): this {
    this
      ._filter(names, true)
      .forEach((route) => (route.deleted = true))

    return this
  }

  /**
   * Register all routes, except the one's defined
   */
  public except (names: string[]): this {
    this
      ._filter(names, false)
      .forEach((route) => (route.deleted = true))

    return this
  }

  /**
   * Register api only routes. The `create` and `edit` routes, which
   * are meant to show forms will not be registered
   */
  public apiOnly (): this {
    return this.except(['.create', '.edit'])
  }

  /**
   * Add middleware to routes inside the resource
   */
  public middleware (middleware: { [name: string]: MiddlewareNode | MiddlewareNode[] }): this {
    for (let name in middleware) {
      if (name === '*') {
        this.routes.forEach((route) => route.middleware(middleware[name]))
      } else {
        const route = this.routes.find((route) => route.name.endsWith(name))
        /* istanbul ignore else */
        if (route) {
          route.middleware(middleware[name])
        }
      }
    }

    return this
  }

  /**
   * Define matcher for params inside the resource
   */
  public where (key: string, matcher: string | RegExp): this {
    this.routes.forEach((route) => {
      route.where(key, matcher)
    })

    return this
  }

  /**
   * Define namespace for all the routes inside a given resource
   */
  public namespace (namespace: string): this {
    this.routes.forEach((route) => {
      route.namespace(namespace)
    })

    return this
  }

  /**
   * Prepend name to the routes names
   */
  public as (name: string): this {
    name = snakeCase(name)
    this.routes.forEach((route) => {
      route.as(route.name.replace(this._resourceName, name), false)
    })

    this._resourceName = name
    return this
  }
}
