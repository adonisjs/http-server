/*
* @poppinss/http-server
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

/**
 * Http context module
 */
declare module '@ioc:Adonis/Src/HttpContext' {
  /// <reference path="./src/contracts.ts" />
  import { HttpContextContract as BaseContextContract } from '@poppinss/http-server/contracts'
  interface HttpContextContract extends BaseContextContract {}
}

/**
 * Router module, this is one of the most involved pieces of
 * this codebase.
 */
declare module '@ioc:Adonis/Src/Route' {
  /// <reference path="./src/contracts.ts" />
  import {
    RouteContract as BaseRouteContract,
    RouteGroupContract as BaseGroupContract,
    RouteResourceContract as BaseResourceContract,
    BriskRouteContract as BaseBriskContract,
    RouterContract as BaseRouterContract,
  } from '@poppinss/http-server/contracts'

  import { HttpContextContract } from '@ioc:Adonis/Src/HttpContext'

  export interface RouteContract extends BaseRouteContract<HttpContextContract> {}
  export interface RouteGroupContract extends BaseGroupContract<HttpContextContract> {}
  export interface RouteResourceContract extends BaseResourceContract<HttpContextContract> {}
  export interface BriskRouteContract extends BaseBriskContract<HttpContextContract> {}

  export interface RouterContract extends BaseRouterContract<
    HttpContextContract,
    RouteContract,
    RouteGroupContract,
    RouteResourceContract,
    BriskRouteContract
  > {}

  const Route: RouterContract
  export default Route
}

/**
 * Http server module
 */
declare module '@ioc:Adonis/Src/Server' {
  /// <reference path="./src/contracts.ts" />
  import { ServerContract as BaseServerContract } from '@poppinss/http-server/contracts'
  import { HttpContextContract } from '@ioc:Adonis/Src/HttpContext'

  interface ServerContract extends BaseServerContract<HttpContextContract> {}
  const Server: ServerContract

  export default Server
}

/**
 * Middleware store contract to register middleware
 */
declare module '@ioc:Adonis/Src/MiddlewareStore' {
  /// <reference path="./src/contracts.ts" />
  import { MiddlewareStoreContract as BaseMiddlewareContract } from '@poppinss/http-server/contracts'
  import { HttpContextContract } from '@ioc:Adonis/Src/HttpContext'

  interface MiddlewareStoreContract extends BaseMiddlewareContract<HttpContextContract> {}
  const MiddlewareStore: MiddlewareStoreContract

  export default MiddlewareStore
}
