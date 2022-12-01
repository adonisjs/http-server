/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HttpContext } from '../http_context/main.js'
import { Constructor } from './base.js'

export type ServerErrorFn = (error: any, ctx: HttpContext) => any

/**
 * Resolved server middleware
 */
export type ServerErrorHandler = {
  handle: ServerErrorFn
}

/**
 * Error handler represented as a class
 */
export type ErrorHandlerAsAClass = Constructor<ServerErrorHandler>
