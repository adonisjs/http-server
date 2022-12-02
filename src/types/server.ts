/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Constructor } from './base.js'
import type { HttpContext } from '../http_context/main.js'

/**
 * Error handler to handle HTTP errors
 */
export type ServerErrorHandler = {
  handle: (error: any, ctx: HttpContext) => any
}

/**
 * Error handler represented as a class
 */
export type ErrorHandlerAsAClass = Constructor<ServerErrorHandler>
