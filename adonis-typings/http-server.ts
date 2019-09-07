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

declare module '@ioc:Adonis/Core/Server' {
  import { Server as HttpsServer } from 'https'
  import { RequestConfigContract } from '@poppinss/request'
  import { ResponseConfigContract } from '@poppinss/response'
  import { IncomingMessage, ServerResponse, Server as HttpServer } from 'http'
  import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
  import { RouteHandlerNode } from '@ioc:Adonis/Core/Route'

  /**
   * Before hooks are executed before finding the route or finding
   * middleware
   */
  export type HookNode = (ctx: HttpContextContract) => Promise<void>

  /**
   * Error handler node
   */
  export type ErrorHandlerNode = ((error: any, ctx: HttpContextContract) => Promise<any>)

  /**
   * HTTP server
   */
  export interface ServerContract {
    instance?: HttpServer | HttpsServer
    errorHandler (handler: ErrorHandlerNode | string): this
    handle (req: IncomingMessage, res: ServerResponse): Promise<void>
    optimize (): void
    before (cb: HookNode): this
    after (cb: HookNode): this
  }

  /**
   * Node after resolving controller.method binding
   * from the route
   */
  export type ResolvedControllerNode = {
    type: 'function',
    handler: Exclude<RouteHandlerNode, string>,
  } | {
    type: 'iocReference',
    namespace: string,
    method: string,
  }

  /**
   * Config requried by request and response
   */
  export type ServerConfigContract = RequestConfigContract & ResponseConfigContract
}
