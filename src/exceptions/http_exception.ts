/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@poppinss/utils'

/**
 * Exception class to represent an HTTP exception
 */
export class HttpException extends Exception {
  body: any
  static code = 'E_HTTP_EXCEPTION'

  /**
   * This method returns an instance of the exception class
   */
  static invoke(body: any, status: number, code: string = 'E_HTTP_EXCEPTION'): HttpException {
    if (body === null || body === undefined) {
      const error = new this('HTTP Exception', { status, code })
      error.body = 'Server error'
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
