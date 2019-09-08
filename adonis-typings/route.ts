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

declare module '@ioc:Adonis/Core/Route' {
  import { MacroableConstructorContract } from 'macroable'
  import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
  import { MiddlewareNode, ResolvedMiddlewareNode } from '@ioc:Adonis/Core/Middleware'

  /**
   * The shape of the route handler
   */
  export type RouteHandlerNode = ((ctx: HttpContextContract) => Promise<any>) | string

  /**
   * Node after resolving controller.method binding
   * from the route
   */
  export type ResolveRouteHandlerNode = {
    type: 'function',
    handler: Exclude<RouteHandlerNode, string>,
  } | {
    type: 'autoload' | 'binding',
    namespace: string,
    method: string,
  }

  /**
   * Route look node is used to find the routes using
   * handler, pattern or name.
   */
  export type RouteLookupNode = {
    handler: RouteHandlerNode,
    pattern: string,
    domain: string,
    name?: string,
  }

  /**
   * Shape of route param matchers
   */
  export type RouteMatchers = {
    [param: string]: RegExp,
  }

  /**
   * Route node persisted within the store
   */
  export type RouteNode = {
    pattern: string,
    /**
     * The router itself doesn't use the handler for anything, it
     * leaves the type to `any` for the consumer to decide the
     * shape of the handler
     */
    handler: RouteHandlerNode,

    /**
     * The router itself doesn't use the middleware for anything, it
     * leaves the type to `any` for the consumer to decide the
     * shape of the middleware
     */
    middleware: MiddlewareNode[],

    /**
     * Any custom runtime properties to be added to the route
     */
    meta: {
      resolvedHandler?: ResolveRouteHandlerNode,
      resolvedMiddleware?: ResolvedMiddlewareNode[]
      namespace?: string,
    } & { [key: string]: any },

    /**
     * A unique name to lookup routes by name
     */
    name?: string,
  }

  /**
   * An object of routes for a given HTTP method
   */
  export type MethodNode = {
    tokens: any[],
    routes: {
      [pattern: string]: RouteNode,
    },
  }

  /**
   * Each domain node will have an object of methods and then
   * a nested object of routes
   */
  export type DomainNode = {
    [method: string]: MethodNode,
  }

  /**
   * Routes tree is a domain of DomainNodes
   */
  export type RoutesTree = {
    tokens: any[],
    domains: {
      [domain: string]: DomainNode,
    },
  }

  /**
   * Route definition returned as a result of `route.toJSON` method
   */
  export type RouteDefinition = RouteNode & {
    methods: string[],
    domain?: string,
    matchers: RouteMatchers,
  }

  /**
   * Shape of the matched route for a pattern, method and domain. We set
   * them as spread options to the context.
   */
  export type MatchedRoute = {
    route: RouteNode,
    params: any,
    subdomains: any,
  }

  /**
   * Shape of route class
   */
  export interface RouteContract {
    deleted: boolean
    name: string
    where (param: string, matcher: string | RegExp): this
    prefix (prefix: string): this
    domain (domain: string): this
    middleware (middleware: any | any[], prepend?: boolean): this
    as (name: string, append?: boolean): this
    namespace (namespace: string): this
    toJSON (): RouteDefinition
  }

  /**
   * Shape of route resource class
   */
  export interface RouteResourceContract {
    routes: RouteContract[]
    only (names: string[]): this
    except (names: string[]): this
    apiOnly (): this
    middleware (middleware: { [name: string]: any | any[] }): this
    where (key: string, matcher: string | RegExp): this
    namespace (namespace: string): this
  }

  /**
   * Shape of route group class
   */
  export interface RouteGroupContract {
    routes: (
      RouteContract
      | RouteResourceContract
      | BriskRouteContract
      | RouteGroupContract
    )[]
    where (param: string, matcher: RegExp | string): this
    prefix (prefix: string): this
    domain (domain: string): this
    as (name: string): this
    middleware (middleware: any | any[]): this
    namespace (namespace: string): this
  }

  /**
   * Shape for brisk/quick routes
   */
  export interface BriskRouteContract {
    route: RouteContract | null
    setHandler (handler: any, invokedBy: string): RouteContract
  }

  /**
   * Shape of router exposed for creating routes
   */
  export interface RouterContract {
    BriskRoute: MacroableConstructorContract,
    RouteGroup: MacroableConstructorContract,
    RouteResource: MacroableConstructorContract,
    Route: MacroableConstructorContract,
    routes: (
      RouteContract |
      RouteResourceContract |
      RouteGroupContract |
      BriskRouteContract
    )[]

    route (pattern: string, methods: string[], handler: RouteHandlerNode): RouteContract
    any (pattern: string, handler: RouteHandlerNode): RouteContract
    get (pattern: string, handler: RouteHandlerNode): RouteContract
    post (pattern: string, handler: RouteHandlerNode): RouteContract
    put (pattern: string, handler: RouteHandlerNode): RouteContract
    patch (pattern: string, handler: RouteHandlerNode): RouteContract
    destroy (pattern: string, handler: RouteHandlerNode): RouteContract
    group (callback: () => void): RouteGroupContract
    resource (resource: string, controller: string): RouteResourceContract
    shallowResource (resource: string, controller: string): RouteResourceContract
    on (pattern: string): BriskRouteContract
    where (key: string, matcher: string | RegExp): this
    toJSON (): RouteNode[]
    commit (): void
    match (url: string, method: string, domain?: string): null | MatchedRoute
    lookup (routeIdentifier: string, domain?: string): null | RouteLookupNode
    forTesting (pattern?: string, methods?: string[], handler?: any): RouteContract
  }

  const Route: RouterContract
  export default Route
}
