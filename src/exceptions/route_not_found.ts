/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HttpException } from './http_exception.js'

/**
 * Exception to abort HTTP requests by throwing error
 */
export class RouteNotFoundException extends HttpException {
  static status = 404
  static code = 'E_ROUTE_NOT_FOUND'
}
