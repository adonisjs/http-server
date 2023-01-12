/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { createError, Exception } from '@poppinss/utils'
import type { HttpContext } from '../http_context/main.js'

export const E_ROUTE_NOT_FOUND = createError<[method: string, url: string]>(
  'Cannot %s:%s',
  'E_ROUTE_NOT_FOUND',
  404
)

export const E_CANNOT_LOOKUP_ROUTE = createError<[routeIdentifier: string]>(
  'Cannot lookup route "%s"',
  'E_CANNOT_LOOKUP_ROUTE',
  500
)

export const E_HTTP_EXCEPTION = class HttpException extends Exception {
  body: any
  static code = 'E_HTTP_EXCEPTION'

  /**
   * This method returns an instance of the exception class
   */
  static invoke(body: any, status: number, code: string = 'E_HTTP_EXCEPTION'): HttpException {
    if (body === null || body === undefined) {
      const error = new this('HTTP Exception', { status, code })
      error.body = 'Internal server error'
      return error
    }

    if (typeof body === 'object') {
      const error = new this(body.message || 'HTTP Exception', { status, code })
      error.body = body
      return error
    }

    const error = new this(body, { status, code })
    error.body = body
    return error
  }
}

export const E_HTTP_REQUEST_ABORTED = class AbortException extends E_HTTP_EXCEPTION {
  handle(error: AbortException, ctx: HttpContext) {
    ctx.response.status(error.status).send(error.body)
  }
}
