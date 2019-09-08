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

declare module '@ioc:Adonis/Core/HttpContext' {
  import { RequestContract } from '@poppinss/request'
  import { ResponseContract } from '@poppinss/response'
  import { LoggerContract } from '@poppinss/logger'
  import { ProfilerRowContract } from '@poppinss/profiler'
  import { RouteNode } from '@ioc:Adonis/Core/Route'

  /**
   * Http request context passed to all middleware
   * and route handler
   */
  export interface HttpContextContract {
    request: RequestContract
    response: ResponseContract
    logger: LoggerContract
    profiler: ProfilerRowContract
    route?: RouteNode
    params: any
    subdomains: any
  }
}
