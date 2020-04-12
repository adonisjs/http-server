/*
* @adonisjs/http-server
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

declare module '@ioc:Adonis/Core/Middleware' {
  import { IocContract } from '@adonisjs/fold'
  import { RouteNode } from '@ioc:Adonis/Core/Route'
  import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

  /**
   * Input middleware node must be function or a string pointing
   * to the IoC container
   */
  export type MiddlewareHandler = string | (
    (ctx: HttpContextContract, next: () => Promise<void>, args?: string[]) => Promise<void>
  )

  /**
   * Shape of resolved middleware. This information is
   * enough to execute the middleware
   */
  export type ResolvedMiddlewareHandler = {
    type: 'function',
    value: Exclude<MiddlewareHandler, string>,
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
    register (middleware: MiddlewareHandler[]): this
    registerNamed (middleware: { [alias: string]: MiddlewareHandler }): this
    get (): ResolvedMiddlewareHandler[]
    getNamed (name: string): null | ResolvedMiddlewareHandler
    invokeMiddleware (
      middleware: ResolvedMiddlewareHandler,
      params: [HttpContextContract, () => Promise<void>],
    ): Promise<void>
  }

  /**
   * The shape of the middleware store constructor. We default export the
   * constructor, since the store instance must be pulled from the
   * server to register/fetch middleware
   */
  export interface MiddlewareStoreConstructorContract {
    new (container: IocContract): MiddlewareStoreContract
  }

  const MiddlewareStore: MiddlewareStoreConstructorContract
  export default MiddlewareStore
}
