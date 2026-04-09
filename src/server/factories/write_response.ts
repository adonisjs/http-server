/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { HttpContext } from '../../http_context/main.ts'

/**
 * Creates a response writer function that finalizes HTTP responses with error handling
 *
 * This factory function returns a response finalizer that:
 * - Calls the response.finish() method to send the response
 * - Catches serialization errors and sends a 500 error response
 * - Logs fatal errors for debugging and monitoring
 *
 * @param ctx - HTTP context containing the response to finalize
 * @returns Response finalization function
 */
export function writeResponse(ctx: HttpContext) {
  /**
   * Finalizes the HTTP response by writing it to the socket with error handling
   */
  return function () {
    try {
      ctx.response.finish()
    } catch (error: any) {
      ctx.logger.fatal({ err: error }, 'Response serialization failed')
      ctx.response.internalServerError(error.message)
      ctx.response.finish()
    }
  }
}
