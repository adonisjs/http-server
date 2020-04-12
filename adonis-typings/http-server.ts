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
  import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
  import { MiddlewareStoreContract } from '@ioc:Adonis/Core/Middleware'
  import { RouteHandlerNode, RouterContract } from '@ioc:Adonis/Core/Route'
  import { IncomingMessage, ServerResponse, Server as HttpServer } from 'http'

  export type CookieOptions = {
    domain: string,
    expires: Date | (() => Date),
    httpOnly: boolean,
    maxAge: number | string,
    path: string,
    sameSite: boolean | 'lax' | 'none' | 'strict',
    secure: boolean,
  }

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
    type: 'class',
    value: any,
  }

  /**
   * Shape of the public methods for the hooks contract. By `public`
   * the one we want to expose to the end user
   */
  export interface HooksContract {
    before (cb: HookNode): this
    after (cb: HookNode): this
  }

  /**
   * HTTP server
   */
  export interface ServerContract {
    instance?: HttpServer | HttpsServer
    router: RouterContract
    hooks: HooksContract
    middleware: MiddlewareStoreContract
    errorHandler (handler: ErrorHandlerNode): this
    handle (req: IncomingMessage, res: ServerResponse): Promise<void>
    optimize (): void
  }

  /**
   * Config requried by request and response
   */
  export type ServerConfigContract = RequestConfigContract & ResponseConfigContract
  const Server: ServerContract
  export default Server
}
