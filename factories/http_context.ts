/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Container } from '@adonisjs/fold'
import type { Logger } from '@adonisjs/logger'
import { LoggerFactory } from '@adonisjs/logger/factories'

import { RequestFactory } from './request.ts'
import { ResponseFactory } from './response.ts'
import type { Request } from '../src/request.ts'
import type { Response } from '../src/response.ts'
import { HttpContext } from '../src/http_context/main.ts'

type FactoryParameters = {
  request: Request
  response: Response
  logger: Logger
}

/**
 * HttpContext factory is used to generate Http context class instances for
 * testing
 */
export class HttpContextFactory {
  /**
   * Factory parameters for creating HTTP context instances
   */
  #parameters: Partial<FactoryParameters> = {}

  /**
   * Returns the request class instance
   */
  #createRequest() {
    return this.#parameters.request || new RequestFactory().create()
  }

  /**
   * Returns the response class instance
   */
  #createResponse() {
    return this.#parameters.response || new ResponseFactory().create()
  }

  /**
   * Returns an instance of the logger class
   */
  #createLogger() {
    return this.#parameters.logger || new LoggerFactory().create()
  }

  /**
   * Merge factory params
   * @param params - Partial factory parameters to merge
   */
  merge(params: Partial<FactoryParameters>) {
    Object.assign(this.#parameters, params)
    return this
  }

  /**
   * Create HTTP context instance
   */
  create() {
    return new HttpContext(
      this.#createRequest(),
      this.#createResponse(),
      this.#createLogger(),
      new Container().createResolver()
    )
  }
}
