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
 * The exception is raised when a route with duplicate name is detected
 */
export class DuplicateRouteNameException extends Exception {
  static status = 500
  static code = 'E_DUPLICATE_ROUTE_NAME'
}
