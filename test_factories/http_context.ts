/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Logger } from '@adonisjs/logger'

import { LoggerFactory } from './logger.js'
import { RequestFactory } from './request.js'
import { ResponseFactory } from './response.js'
import type { Request } from '../src/request.js'
import type { Response } from '../src/response.js'
import { HttpContext } from '../src/http_context/main.js'

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
   */
  merge(params: Partial<FactoryParameters>) {
    Object.assign(this.#parameters, params)
    return this
  }

  /**
   * Create request
   */
  create() {
    return new HttpContext(this.#createRequest(), this.#createResponse(), this.#createLogger())
  }
}
