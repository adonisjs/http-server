/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { createError, Exception } from '@poppinss/utils/exception'
import type { HttpContext } from './http_context/main.ts'

/**
 * Thrown when unable to find a matching route for the given request.
 *
 * This error is raised when the router cannot match the incoming HTTP method
 * and URL pattern to any registered route in the application.
 *
 * @example
 * ```ts
 * throw new E_ROUTE_NOT_FOUND(['GET', '/nonexistent'])
 * ```
 */
export const E_ROUTE_NOT_FOUND = createError<[method: string, url: string]>(
  'Cannot %s:%s',
  'E_ROUTE_NOT_FOUND',
  404
)

/**
 * Thrown when unable to lookup a route by its identifier.
 *
 * This error occurs when trying to generate URLs or find routes using
 * a route name, pattern, or controller reference that doesn't exist.
 *
 * @example
 * ```ts
 * throw new E_CANNOT_LOOKUP_ROUTE(['nonexistent.route'])
 * ```
 */
export const E_CANNOT_LOOKUP_ROUTE = createError<[routeIdentifier: string]>(
  'Cannot lookup route "%s"',
  'E_CANNOT_LOOKUP_ROUTE',
  500
)

/**
 * A generic HTTP exception for converting errors to HTTP responses.
 *
 * This class provides a standardized way to create HTTP exceptions with
 * specific status codes and response bodies. It handles various input types
 * including strings, objects, and null/undefined values.
 *
 * @example
 * ```ts
 * throw E_HTTP_EXCEPTION.invoke('Not found', 404)
 * throw E_HTTP_EXCEPTION.invoke({ error: 'Invalid data' }, 422)
 * ```
 */
export const E_HTTP_EXCEPTION = class HttpException extends Exception {
  body: any
  static code = 'E_HTTP_EXCEPTION'

  /**
   * Creates and returns an instance of the HttpException class.
   *
   * @param body - The response body (string, object, or null/undefined)
   * @param status - HTTP status code for the response
   * @param code - Optional error code (defaults to 'E_HTTP_EXCEPTION')
   *
   * @example
   * ```ts
   * const error = HttpException.invoke('Resource not found', 404)
   * const error2 = HttpException.invoke({ message: 'Validation failed' }, 422)
   * ```
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

/**
 * Thrown when the "response.abort" method is called.
 *
 * This exception is used to immediately terminate request processing
 * and send a response. It includes a built-in handler that automatically
 * sends the appropriate status and body to the client.
 *
 * @example
 * ```ts
 * throw new E_HTTP_REQUEST_ABORTED()
 * ```
 */
export const E_HTTP_REQUEST_ABORTED = class AbortException extends E_HTTP_EXCEPTION {
  handle(error: AbortException, ctx: HttpContext) {
    ctx.response.status(error.status).send(error.body)
  }
}
