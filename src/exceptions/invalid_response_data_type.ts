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
 * The exception is raised when unable to serialize the outgoing
 * HTTP response
 */
export class InvalidResponseDataTypeException extends Exception {
  static status = 500
  static code = 'E_INVALID_RESPONSE_DATA_TYPE'
}
