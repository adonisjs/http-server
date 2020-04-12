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
  import { RouterContract } from '@ioc:Adonis/Core/Route'
  import { RequestConfig } from '@ioc:Adonis/Core/Request'
  import { ResponseConfig } from '@ioc:Adonis/Core/Response'
  import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
  import { MiddlewareStoreContract } from '@ioc:Adonis/Core/Middleware'
  import { IncomingMessage, ServerResponse, Server as HttpServer } from 'http'

  /**
   * Before hooks are executed before finding the route or finding
   * middleware
   */
  export type HookHandler = (ctx: HttpContextContract) => Promise<void>

  /**
   * Error handler node
   */
  export type ErrorHandler = string | ((error: any, ctx: HttpContextContract) => Promise<any>)

  /**
   * Shape of resolved error handler node
   */
  export type ResolvedErrorHandler = {
    type: 'function',
    value: Exclude<ErrorHandler, string>,
  } | {
    type: 'class',
    value: any,
  }

  /**
   * Shape of the public methods for the hooks contract. By `public`
   * the one we want to expose to the end user
   */
  export interface HooksContract {
    before (cb: HookHandler): this
    after (cb: HookHandler): this
  }

  /**
   * HTTP server
   */
  export interface ServerContract {
    instance?: HttpServer | HttpsServer
    router: RouterContract
    hooks: HooksContract
    middleware: MiddlewareStoreContract
    errorHandler (handler: ErrorHandler): this
    handle (req: IncomingMessage, res: ServerResponse): Promise<void>
    optimize (): void
  }

  /**
   * Config requried by request and response
   */
  export type ServerConfig = RequestConfig & ResponseConfig
  const Server: ServerContract
  export default Server
}
