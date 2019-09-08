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

declare module '@ioc:Adonis/Core/Middleware' {
  import { RouteNode } from '@ioc:Adonis/Core/Route'
  import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

  /**
   * Input middleware node must be function or a string pointing
   * to the IoC container
   */
  export type MiddlewareNode = string | (
    (ctx: HttpContextContract, next: () => Promise<void>, args?: string[]) => Promise<void>
  )

  /**
   * Shape of resolved middleware. This information is
   * enough to execute the middleware
   */
  export type ResolvedMiddlewareNode = {
    type: 'function',
    value: Exclude<MiddlewareNode, string>,
    args: string[],
  } | {
    type: 'autoload' | 'binding',
    namespace: string,
    method: string,
    args: string[],
  }

  /**
   * Shape of middleware store to store and fetch middleware
   * at runtime
   */
  export interface MiddlewareStoreContract {
    register (middleware: MiddlewareNode[]): this
    registerNamed (middleware: { [alias: string]: MiddlewareNode }): this
    get (): ResolvedMiddlewareNode[]
    getNamed (name: string): null | ResolvedMiddlewareNode
    invokeMiddleware (
      middleware: ResolvedMiddlewareNode,
      params: [HttpContextContract, () => Promise<void>],
    ): Promise<void>
  }
}
