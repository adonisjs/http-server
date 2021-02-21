/**
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
  import { ProfilerRowContract } from '@ioc:Adonis/Core/Profiler'
  import { ApplicationContract } from '@ioc:Adonis/Core/Application'

  /**
   * Http request context passed to all middleware
   * and route handler
   */
  export interface HttpContextContract {
    /**
     * A helper to see top level properties on the context object
     */
    inspect(): any
    request: RequestContract
    response: ResponseContract
    logger: LoggerContract
    profiler: ProfilerRowContract
    route?: RouteNode
    routeKey: string
    params: Record<string, any>
    subdomains: Record<string, any>
  }

  /**
   * Shape of the constructor. We export the constructor and not
   * the context instance, since that is passed to the HTTP
   * lifecycle
   */
  export interface HttpContextConstructorContract
    extends MacroableConstructorContract<HttpContextContract> {
    app?: ApplicationContract

    /**
     * Creates a new fake context instance for a given route.
     */
    create(
      routePattern: string,
      routeParams: Record<string, any>,
      req?: IncomingMessage,
      res?: ServerResponse
    ): HttpContextContract

    new (
      request: RequestContract,
      response: ResponseContract,
      logger: LoggerContract,
      profiler: ProfilerRowContract
    ): HttpContextContract
  }

  const HttpContext: HttpContextConstructorContract
  export default HttpContext
}
