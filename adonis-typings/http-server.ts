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

declare module '@ioc:Adonis/Core/Server' {
  import { Server as HttpsServer } from 'https'
  import { RequestConfigContract } from '@ioc:Adonis/Core/Request'
  import { ResponseConfigContract } from '@ioc:Adonis/Core/Response'
  import { IncomingMessage, ServerResponse, Server as HttpServer } from 'http'
  import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
  import { RouteHandlerNode, RouterContract } from '@ioc:Adonis/Core/Route'
  import { MiddlewareStoreContract } from '@ioc:Adonis/Core/Middleware'

  /**
   * Before hooks are executed before finding the route or finding
   * middleware
   */
  export type HookNode = (ctx: HttpContextContract) => Promise<void>

  /**
   * Error handler node
   */
  export type ErrorHandlerNode = string | ((error: any, ctx: HttpContextContract) => Promise<any>)

  /**
   * Shape of resolved error handler node
   */
  export type ResolvedErrorHandlerNode = {
    type: 'function',
    value: Exclude<ErrorHandlerNode, string>,
  } | {
    type: 'autoload' | 'binding',
    namespace: string,
    method: string,
  }

  /**
   * HTTP server
   */
  export interface ServerContract {
    instance?: HttpServer | HttpsServer
    router: RouterContract
    middleware: MiddlewareStoreContract
    errorHandler (handler: ErrorHandlerNode): this
    handle (req: IncomingMessage, res: ServerResponse): Promise<void>
    optimize (): void
  }

  /**
   * Node after resolving controller.method binding
   * from the route
   */
  export type ResolvedControllerNode = {
    type: 'function',
    handler: Exclude<RouteHandlerNode, string>,
  } | {
    type: 'autoload' | 'binding',
    namespace: string,
    method: string,
  }

  /**
   * Config requried by request and response
   */
  export type ServerConfigContract = RequestConfigContract & ResponseConfigContract
}
