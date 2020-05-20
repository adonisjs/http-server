/**
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
import { lodash } from '@poppinss/utils'

import { MiddlewareHandler } from '@ioc:Adonis/Core/Middleware'
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
  private resourceName: string = this.resource
    .split('.')
    .map((token) => lodash.snakeCase(token)).join('.')

  constructor (
    private resource: string,
    private controller: string,
    private globalMatchers: RouteMatchers,
    private shallow = false,
  ) {
    super()
    this.buildRoutes()
  }

  /**
   * Add a new route for the given pattern, methods and controller action
   */
  private makeRoute (pattern: string, methods: string[], action: string) {
    const route = new Route(
      pattern,
      methods,
      `${this.controller}.${action}`,
      this.globalMatchers,
    )

    route.as(`${this.resourceName}.${action}`)
    this.routes.push(route)
  }

  /**
   * Build routes for the given resource
   */
  private buildRoutes () {
    this.resource = this.resource.replace(/^\//, '').replace(/\/$/, '')

    const resourceTokens = this.resource.split('.')
    const mainResource = resourceTokens.pop()!

    const fullUrl = `${resourceTokens
      .map((token) => `${token}/:${lodash.snakeCase(singular(token))}_id`)
      .join('/')}/${mainResource}`

    this.makeRoute(fullUrl, ['GET'], 'index')
    this.makeRoute(`${fullUrl}/create`, ['GET'], 'create')
    this.makeRoute(fullUrl, ['POST'], 'store')
    this.makeRoute(`${this.shallow ? mainResource : fullUrl}/:id`, ['GET'], 'show')
    this.makeRoute(`${this.shallow ? mainResource : fullUrl}/:id/edit`, ['GET'], 'edit')
    this.makeRoute(`${this.shallow ? mainResource : fullUrl}/:id`, ['PUT', 'PATCH'], 'update')
    this.makeRoute(`${this.shallow ? mainResource : fullUrl}/:id`, ['DELETE'], 'destroy')
  }

  /**
   * Filter the routes based on their partial names
   */
  private filter (names: string[], inverse: boolean) {
    return this.routes.filter((route) => {
      const match = names.find((name) => route.name!.endsWith(name))
      return inverse ? !match : match
    })
  }

  /**
   * Register only given routes and remove others
   */
  public only (names: string[]): this {
    this.filter(names, true).forEach((route) => (route.deleted = true))
    return this
  }

  /**
   * Register all routes, except the one's defined
   */
  public except (names: string[]): this {
    this.filter(names, false).forEach((route) => (route.deleted = true))
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
  public middleware (middleware: { [name: string]: MiddlewareHandler | MiddlewareHandler[] }): this {
    for (let name in middleware) {
      if (name === '*') {
        this.routes.forEach((one) => one.middleware(middleware[name]))
      } else {
        const route = this.routes.find((one) => one.name!.endsWith(name))
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
    name = lodash.snakeCase(name)
    this.routes.forEach((route) => {
      route.as(route.name!.replace(this.resourceName, name), false)
    })

    this.resourceName = name
    return this
  }
}
