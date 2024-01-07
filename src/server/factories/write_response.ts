/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { HttpContext } from '../../http_context/main.js'

/**
 * Writes the response to the socket. The "finish" method can
 * raise error when unable to serialize the response.
 */
export function writeResponse(ctx: HttpContext) {
  return function () {
    try {
      ctx.response.finish()
    } catch (error) {
      ctx.logger.fatal({ err: error }, 'Response serialization failed')
      ctx.response.internalServerError(error.message)
      ctx.response.finish()
    }
  }
}
