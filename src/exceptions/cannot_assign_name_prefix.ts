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
 * The exception is raised when unable to find a route by
 * its name, route pattern or the controller.method name
 */
export class CannotAssignRouteNamePrefix extends Exception {
  static status = 500
  static code = 'E_ASSIGN_ROUTE_NAME_PREFIX'
}
