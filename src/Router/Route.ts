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

import { Macroable } from 'macroable'
import { RouteDefinition, RouteMatchers, RouteContract, RouteHandlerNode } from '@ioc:Adonis/Core/Route'
import { MiddlewareNode } from '@ioc:Adonis/Core/Middleware'

import { dropSlash } from '../helpers'

/**
 * Route class is used to construct consistent [[RouteDefinition]] using
 * fluent API. An instance of route is usually obtained using the
 * [[Router]] class helper methods.
 *
 * @example
 * ```ts
 * const route = new Route('posts/:id', ['GET'], async function () {
 * })
 *
 * route
 *   .where('id', /^[0-9]+$/)
 *   .middleware(async function () {
 *   })
 * ```
 */
export class Route extends Macroable implements RouteContract {
  protected static _macros = {}
  protected static _getters = {}

  /**
   * By default the route is part of `root` domain. Root
   * domain is used when no domain is defined
   */
  private _domain: string = 'root'

  /**
   * An object of matchers to be forwarded to the
   * store. The matchers list is populated by
   * calling `where` method
   */
  private _matchers: RouteMatchers = {}

  /**
   * Custom prefixes. Usually added to a group of routes. We keep an array of them
   * since nested groups will want all of them ot concat.
   */
  private _prefixes: string[] = []

  /**
   * An array of middleware. Added using `middleware` function
   */
  private _middleware: MiddlewareNode[] = []

  /**
   * Storing the namespace explicitly set using `route.namespace` method
   */
  private _explicitNamespace: string

  /**
   * A boolean to prevent route from getting registered within
   * the [[Store]].
   *
   * This flag must be set before [[Router.commit]] method
   */
  public deleted: boolean = false

  /**
   * A unique name to lookup the route
   */
  public name: string

  constructor (
    private _pattern: string,
    private _methods: string[],
    private _handler: RouteHandlerNode,
    private _globalMatchers: RouteMatchers,
  ) {
    super()
  }

  /**
   * Returns an object of param matchers by merging global and local
   * matchers. The local copy is given preference over the global
   * one's
   */
  private _getMatchers (): RouteMatchers {
    return Object.assign({}, this._globalMatchers, this._matchers)
  }

  /**
   * Returns a normalized pattern string by prefixing the `prefix` (if defined).
   */
  private _getPattern (): string {
    const pattern = dropSlash(this._pattern)
    const prefix = this._prefixes.slice().reverse().map((prefix) => dropSlash(prefix)).join('')
    return prefix ? `${prefix}${pattern === '/' ? '' : pattern}` : pattern
  }

  /**
   * Define Regex matcher for a given param. If a matcher exists, then we do not
   * override that, since the routes inside a group will set matchers before
   * the group, so they should have priority over the route matchers.
   *
   * ```
   * Route.group(() => {
   *   Route.get('/:id', 'handler').where('id', /^[0-9]$/)
   * }).where('id', /[^a-z$]/)
   * ```
   *
   * The `/^[0-9]$/` should win over the matcher defined by the group
   */
  public where (param: string, matcher: string | RegExp): this {
    if (this._matchers[param]) {
      return this
    }

    this._matchers[param] = typeof (matcher) === 'string' ? new RegExp(matcher) : matcher
    return this
  }

  /**
   * Define prefix for the route. Prefixes will be concated
   * This method is mainly exposed for the [[RouteGroup]]
   */
  public prefix (prefix: string): this {
    this._prefixes.push(prefix)
    return this
  }

  /**
   * Define a custom domain for the route. Again we do not overwrite the domain
   * unless `overwrite` flag is set to true.
   *
   * This is again done to make route.domain win over route.group.domain
   */
  public domain (domain: string, overwrite: boolean = false): this {
    if (this._domain === 'root' || overwrite) {
      this._domain = domain
    }
    return this
  }

  /**
   * Define an array of middleware to be executed on the route. If `prepend`
   * is true, then middleware will be added to start of the existing
   * middleware. The option is exposed for [[RouteGroup]]
   */
  public middleware (middleware: MiddlewareNode | MiddlewareNode[], prepend = false): this {
    middleware = Array.isArray(middleware) ? middleware : [middleware]
    this._middleware = prepend ? middleware.concat(this._middleware) : this._middleware.concat(middleware)
    return this
  }

  /**
   * Give memorizable name to the route. This is helpful, when you
   * want to lookup route defination by it's name.
   *
   * If `append` is true, then it will keep on appending to the existing
   * name. This option is exposed for [[RouteGroup]]
   */
  public as (name: string, append = false): this {
    this.name = append ? `${name}.${this.name}` : name
    return this
  }

  /**
   * Define controller namespace for a given route
   */
  public namespace (namespace: string, overwrite: boolean = false): this {
    if (!this._explicitNamespace || overwrite) {
      this._explicitNamespace = namespace
    }
    return this
  }

  /**
   * Returns [[RouteDefinition]] that can be passed to the [[Store]] for
   * registering the route
   */
  public toJSON (): RouteDefinition {
    return {
      domain: this._domain,
      pattern: this._getPattern(),
      matchers: this._getMatchers(),
      meta: {
        namespace: this._explicitNamespace,
      },
      name: this.name,
      handler: this._handler,
      methods: this._methods,
      middleware: this._middleware,
    }
  }
}
