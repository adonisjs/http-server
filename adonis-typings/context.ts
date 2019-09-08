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
  import { RouteNode } from '@ioc:Adonis/Core/Route'
  import { RequestContract } from '@ioc:Adonis/Core/Request'
  import { ResponseContract } from '@ioc:Adonis/Core/Response'
  import { LoggerContract } from '@ioc:Adonis/Core/Logger'
  import { ProfilerRowContract } from '@ioc:Adonis/Core/Profiler'

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
