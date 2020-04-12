/*
* @adonisjs/http-server
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

declare module '@ioc:Adonis/Core/HttpContext' {
  import { RouteNode } from '@ioc:Adonis/Core/Route'
  import { IncomingMessage, ServerResponse } from 'http'
  import { MacroableConstructorContract } from 'macroable'
  import { LoggerContract } from '@ioc:Adonis/Core/Logger'
  import { RequestContract } from '@ioc:Adonis/Core/Request'
  import { ResponseContract } from '@ioc:Adonis/Core/Response'
  import { ServerConfigContract } from '@ioc:Adonis/Core/Server'
  import { ProfilerRowContract } from '@ioc:Adonis/Core/Profiler'
  import { EncryptionContract } from '@ioc:Adonis/Core/Encryption'

  /**
   * Http request context passed to all middleware
   * and route handler
   */
  export interface HttpContextContract {
    /**
     * A helper to see top level properties on the context object
     */
    inspect (): any,
    request: RequestContract
    response: ResponseContract
    logger: LoggerContract
    profiler: ProfilerRowContract
    route?: RouteNode
    params: any
    subdomains: any
  }

  /**
   * Shape of the constructor. We export the constructor and not
   * the context instance, since that is passed to the HTTP
   * lifecycle
   */
  export interface HttpContextConstructorContract extends MacroableConstructorContract<HttpContextContract> {
    create (
      routePattern: string,
      routeParams: any,
      logger: LoggerContract,
      profiler: ProfilerRowContract,
      encryption: EncryptionContract,
      req?: IncomingMessage,
      res?: ServerResponse,
      serverConfig?: ServerConfigContract,
    ): HttpContextContract

    new (
      request: RequestContract,
      response: ResponseContract,
      logger: LoggerContract,
      profiler: ProfilerRowContract,
    ): HttpContextContract
  }

  const HttpContext: HttpContextConstructorContract
  export default HttpContext
}
