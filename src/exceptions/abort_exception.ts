/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HttpException } from './http_exception.js'
import type { HttpContext } from '../http_context/main.js'

/**
 * Exception to abort HTTP requests by throwing error
 */
export class AbortException extends HttpException {
  handle(error: HttpException, ctx: HttpContext) {
    ctx.response.status(error.status).send(error.body)
  }
}
