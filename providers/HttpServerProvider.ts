/*
 * @adonisjs/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import { IocContract } from '@adonisjs/fold'
import { Request } from '../src/Request'
import { Response } from '../src/Response'
import { MiddlewareStore } from '../src/MiddlewareStore'
import { Server } from '../src/Server'
import { HttpContext } from '../src/HttpContext'

export default class HttpServerProvider {
  constructor (protected $container: IocContract) {}

  /**
   * Register request and response bindings to the container
   */
  protected $registerRequestResponse () {
    this.$container.bind('Adonis/Core/Request', () => Request)
    this.$container.bind('Adonis/Core/Response', () => Response)
  }

  /**
   * Registering middleware store to the container
   */
  protected $registerMiddlewareStore () {
    this.$container.bind('Adonis/Core/MiddlewareStore', () => MiddlewareStore)
  }

  /**
   * Registering the HTTP context
   */
  protected $registerHTTPContext () {
    this.$container.bind('Adonis/Core/HttpContext', () => HttpContext)
  }

  /**
   * Register the HTTP server
   */
  protected $registerHttpServer () {
    this.$container.singleton('Adonis/Core/Server', () => {
      const Logger = this.$container.use('Adonis/Core/Logger')
      const Profiler = this.$container.use('Adonis/Core/Profiler')
      const Config = this.$container.use('Adonis/Core/Config')

      const config = Object.assign({ secret: Config.get('app.appKey') }, Config.get('app.http', {}))
      return new Server(this.$container, Logger, Profiler,config)
    })
  }

  /**
   * Register the router. The router points to the instance of router used
   * by the middleware
   */
  protected $registerRouter () {
    this.$container.singleton('Adonis/Core/Route', () => {
      const Server = this.$container.use('Adonis/Core/Server')
      return Server.router
    })
  }

  /**
   * Registering all bindings
   */
  public register () {
    this.$registerRequestResponse()
    this.$registerMiddlewareStore()
    this.$registerHttpServer()
    this.$registerHTTPContext()
    this.$registerRouter()
  }
}
