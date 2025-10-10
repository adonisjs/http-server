/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { debuglog } from 'node:util'

/**
 * Debug logger instance for the AdonisJS HTTP server package.
 *
 * This debug logger can be enabled by setting the NODE_DEBUG environment variable
 * to include 'adonisjs:http'. When enabled, it will output detailed debugging
 * information about HTTP server operations including route matching, middleware
 * execution, and response generation.
 *
 * @example
 * ```bash
 * NODE_DEBUG=adonisjs:http node ace serve
 * ```
 */
export default debuglog('adonisjs:http')
