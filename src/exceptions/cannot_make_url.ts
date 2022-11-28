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
 * The exception is raised when unable to make a URL for
 * a given route
 */
export class CannotMakeURLException extends Exception {
  static status = 500
  static code = 'E_CANNOT_MAKE_URL'
}
