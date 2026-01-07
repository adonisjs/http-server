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

import { HttpRequestFactory } from './request.ts'
import { HttpResponseFactory } from './response.ts'
import type { HttpRequest } from '../src/request.ts'
import type { HttpResponse } from '../src/response.ts'
import { HttpContext } from '../src/http_context/main.ts'
import { createURL, parseRoute } from '../src/helpers.ts'
import { QsParserFactory } from './qs_parser_factory.ts'

type FactoryParameters = {
  request: HttpRequest
  response: HttpResponse
  logger: Logger
  url?: string
  method?: string
  route?: {
    pattern: string
    params: Record<string, any>
  }
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
    if (this.#parameters.request) {
      return this.#parameters.request
    }

    let { url, method, route } = this.#parameters
    if (route) {
      url = createURL(
        route.pattern,
        parseRoute(route.pattern),
        new QsParserFactory().create().stringify,
        route.params
      )
    }

    return new HttpRequestFactory().merge({ url, method }).create()
  }

  /**
   * Returns the response class instance
   */
  #createResponse() {
    return this.#parameters.response || new HttpResponseFactory().create()
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
