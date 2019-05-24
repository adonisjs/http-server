/*
* @poppinss/http-server
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

/// <reference path="../src/contracts.ts" />
/// <reference types="@poppinss/response/build/adonis-typings" />
/// <reference types="@poppinss/request/build/adonis-typings" />
/// <reference types="@poppinss/logger/build/adonis-typings" />

declare module '@ioc:Adonis/Src/HttpContext' {
  import { HttpContextContract as BaseContextContract, ServerConfig } from '@poppinss/http-server/contracts'
  import { ResponseContract } from '@ioc:Adonis/Src/Response'
  import { RequestContract } from '@ioc:Adonis/Src/Request'
  import { LoggerContract } from '@ioc:Adonis/Src/Logger'
  import { IncomingMessage, ServerResponse } from 'http'

  export interface HttpContextContract extends BaseContextContract {
    response: ResponseContract,
    request: RequestContract,
    logger: LoggerContract,
  }

  export interface HttpContextConstructorContract {
    create (
      routePattern: string,
      routeParams: any,
      req?: IncomingMessage,
      res?: ServerResponse,
      serverConfig?: ServerConfig,
    ): HttpContextContract
  }

  const HttpContext: HttpContextConstructorContract
  export default HttpContext
}

/**
 * Router module, this is one of the most involved pieces of
 * this codebase.
 */
declare module '@ioc:Adonis/Src/Route' {
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
  import { ServerContract as BaseServerContract } from '@poppinss/http-server/contracts'
  import { HttpContextContract } from '@ioc:Adonis/Src/HttpContext'

  export interface ServerContract extends BaseServerContract<HttpContextContract> {}
  const Server: ServerContract

  export default Server
}

/**
 * Middleware store contract to register middleware
 */
declare module '@ioc:Adonis/Src/MiddlewareStore' {
  import { MiddlewareStoreContract as BaseMiddlewareContract } from '@poppinss/http-server/contracts'
  import { HttpContextContract } from '@ioc:Adonis/Src/HttpContext'

  export interface MiddlewareStoreContract extends BaseMiddlewareContract<HttpContextContract> {}
  const MiddlewareStore: MiddlewareStoreContract

  export default MiddlewareStore
}
