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
 * The exception is raised when a duplicate param is
 * found in the route.
 */
export class InvalidResourceNameException extends Exception {
  static status = 500
  static code = 'E_INVALID_RESOURCE_NAME'
}
