/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { QSParserConfig } from './qs.js'
import type { Constructor } from './base.js'
import type { RequestConfig } from './request.js'
import type { ResponseConfig } from './response.js'
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

/**
 * Config accepted by the HTTP server
 */
export type ServerConfig = RequestConfig &
  ResponseConfig & {
    /**
     * Whether or not to create an async local storage store for
     * the HTTP context.
     *
     * Defaults to false
     */
    useAsyncLocalStorage: boolean

    /**
     * Config for query string parser
     */
    qs: QSParserConfig
  }
