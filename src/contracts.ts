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

declare module '@poppinss/http-server/contracts' {
  import { Server as HttpsServer } from 'https'
  import { MacroableConstructorContract } from 'macroable'
  import { IncomingMessage, ServerResponse, Server as HttpServer } from 'http'
  import { RequestContract, RequestConfigContract } from '@poppinss/request'
  import { ResponseContract, ResponseConfigContract } from '@poppinss/response'
  import { LoggerContract } from '@poppinss/logger'

  /**
   * The shape of the route handler
   */
  type RouteHandlerNode<Context> = ((ctx: Context) => Promise<any>) | string

  /**
   * Input middleware node must be function or a string pointing
   * to the IoC container
   */
  type MiddlewareNode<Context> = string | (
    (ctx: Context, next: () => Promise<void>, args?: string[]) => Promise<void>
  )

  /**
   * Before hooks are executed before finding the route or finding
   * middleware
   */
  type HookNode<Context> = (ctx: Context) => Promise<void>

  /**
   * Error handler node
   */
  type ErrorHandlerNode<Context> = (error: any, ctx: Context) => Promise<any>

  /**
   * Route look node is used to find the routes using
   * handler, pattern or name.
   */
  type RouteLookupNode<Context> = {
    handler: RouteHandlerNode<Context>,
    pattern: string,
    domain: string,
    name?: string,
  }

  /**
   * Shape of route param matchers
   */
  type RouteMatchers = {
    [param: string]: RegExp,
  }

  /**
   * Route node persisted within the store
   */
  type RouteNode<Context> = {
    pattern: string,
    /**
     * The router itself doesn't use the handler for anything, it
     * leaves the type to `any` for the consumer to decide the
     * shape of the handler
     */
    handler: RouteHandlerNode<Context>,

    /**
     * The router itself doesn't use the middleware for anything, it
     * leaves the type to `any` for the consumer to decide the
     * shape of the middleware
     */
    middleware: MiddlewareNode<Context>[],

    /**
     * Any custom runtime properties to be added to the route
     */
    meta: any,

    /**
     * A unique name to lookup routes by name
     */
    name?: string,
  }

  /**
   * An object of routes for a given HTTP method
   */
  type MethodNode<Context> = {
    tokens: any[],
    routes: {
      [pattern: string]: RouteNode<Context>,
    },
  }

  /**
   * Each domain node will have an object of methods and then
   * a nested object of routes
   */
  type DomainNode<Context> = {
    [method: string]: MethodNode<Context>,
  }

  /**
   * Routes tree is a domain of DomainNodes
   */
  type RoutesTree<Context> = {
    tokens: any[],
    domains: {
      [domain: string]: DomainNode<Context>,
    },
  }

  /**
   * Route defination returned as a result of `route.toJSON` method
   */
  type RouteDefination<Context> = RouteNode<Context> & {
    methods: string[],
    domain?: string,
    matchers: RouteMatchers,
  }

  /**
   * Shape of the matched route for a pattern, method and domain. We set
   * them as spread options to the context.
   */
  type MatchedRoute<Context> = {
    route: RouteNode<Context>,
    params: any,
    subdomains: any,
  }

  /**
   * Shape of route class
   */
  interface RouteContract<Context> {
    deleted: boolean,
    name: string,
    where (param: string, matcher: string | RegExp): this,
    prefix (prefix: string): this,
    domain (domain: string): this,
    middleware (middleware: any | any[], prepend?: boolean): this,
    as (name: string, append?: boolean): this,
    namespace (namespace: string): this,
    toJSON (): RouteDefination<Context>,
  }

  /**
   * Shape of route resource class
   */
  interface RouteResourceContract<Context> {
    routes: RouteContract<Context>[],
    only (names: string[]): this,
    except (names: string[]): this,
    apiOnly (): this,
    middleware (middleware: { [name: string]: any | any[] }): this,
    where (key: string, matcher: string | RegExp): this,
    namespace (namespace: string): this,
  }

  /**
   * Shape of route group class
   */
  interface RouteGroupContract<Context> {
    routes: (RouteContract<Context> | RouteResourceContract<Context> | BriskRouteContract<Context>)[],
    where (param: string, matcher: RegExp | string): this,
    prefix (prefix: string): this,
    domain (domain: string): this,
    as (name: string): this,
    middleware (middleware: any | any[]): this,
    namespace (namespace: string): this,
  }

  /**
   * Shape for brisk/quick routes
   */
  interface BriskRouteContract<Context> {
    route: RouteContract<Context> | null,
    setHandler (handler: any, invokedBy: string): RouteContract<Context>,
  }

  /**
   * Shape of router exposed for creating routes
   */
  interface RouterContract<
    Context,
    Route = RouteContract<Context>,
    Group = RouteGroupContract<Context>,
    Resource = RouteResourceContract<Context>,
    Brisk = BriskRouteContract<Context>,
  > {
    BriskRoute: MacroableConstructorContract,
    RouteGroup: MacroableConstructorContract,
    RouteResource: MacroableConstructorContract,
    Route: MacroableConstructorContract,
    routes: (
      RouteContract<Context> |
      RouteResourceContract<Context> |
      RouteGroupContract<Context> |
      BriskRouteContract<Context>
    )[],

    route (pattern: string, methods: string[], handler: RouteHandlerNode<Context>): Route,
    any (pattern: string, handler: RouteHandlerNode<Context>): Route,
    get (pattern: string, handler: RouteHandlerNode<Context>): Route,
    post (pattern: string, handler: RouteHandlerNode<Context>): Route,
    put (pattern: string, handler: RouteHandlerNode<Context>): Route,
    patch (pattern: string, handler: RouteHandlerNode<Context>): Route,
    destroy (pattern: string, handler: RouteHandlerNode<Context>): Route,
    group (callback: () => void): Group,
    resource (resource: string, controller: string): Resource,
    shallowResource (resource: string, controller: string): Resource,
    on (pattern: string): Brisk,
    where (key: string, matcher: string | RegExp): this,
    namespace (namespace: string): this,
    toJSON (): RouteNode<Context>[]
    find (url: string, method: string, domain?: string): null | MatchedRoute<Context>,
    urlFor (pattern: string, options: { params?: any, qs?: any }, domain?: string): null | string,
    forTesting (pattern?: string, methods?: string[], handler?: any): Route,
  }

  /**
   * HTTP server
   */
  interface ServerContract<Context extends HttpContextContract> {
    instance?: HttpServer | HttpsServer,
    onError (cb: ErrorHandlerNode<Context>): this
    handle (req: IncomingMessage, res: ServerResponse): Promise<void>
    optimize (): void
    before (cb: HookNode<Context>): this
    after (cb: HookNode<Context>): this
  }

  /**
   * Http request context passed to all middleware
   * and route handler
   */
  interface HttpContextContract {
    request: RequestContract,
    response: ResponseContract,
    logger: LoggerContract,
    route?: RouteNode<this>,
    params?: any,
    subdomains?: any,
  }

  /**
   * Shape of resolved middleware. This information is
   * enough to execute the middleware
   */
  type ResolvedMiddlewareNode<Context> = {
    type: 'function',
    value: Exclude<MiddlewareNode<Context>, string>,
    args: string[],
  } | {
    type: 'class',
    value: {
      handle: Exclude<MiddlewareNode<Context>, string>,
    },
    args: string[],
  }

  /**
   * Node after resolving controller.method binding
   * from the route
   */
  type ResolvedControllerNode<Context> = {
    type: 'function',
    handler: Exclude<RouteHandlerNode<Context>, string>,
  } | {
    type: 'iocReference',
    namespace: string,
    method: string,
  }

  /**
   * Shape of middleware store to store and fetch middleware
   * at runtime
   */
  interface MiddlewareStoreContract<Context> {
    register (middleware: MiddlewareNode<Context>[]): this,
    registerNamed (middleware: { [alias: string]: MiddlewareNode<Context> }): this,
    get (): ResolvedMiddlewareNode<Context>[],
    getNamed (name: string): null | ResolvedMiddlewareNode<Context>,
    preCompileMiddleware (route: RouteNode<Context>): void,
  }

  /**
   * Config requried by request and response
   */
  type ServerConfig = RequestConfigContract & ResponseConfigContract
}
