/**
 * @adonisjs/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { base64, MessageBuilder } from '@poppinss/utils'

/**
 * Encodes a value into a base64 url encoded string to
 * be set as cookie
 */
export function pack (value: any): null | string {
  if (value === undefined || value === null) {
    return null
  }
  return base64.urlEncode(new MessageBuilder().build(value))
}

/**
 * Returns true when this `unpack` method of this module can attempt
 * to unpack the encode value.
 */
export function canUnpack (encodedValue: string) {
  return typeof encodedValue === 'string'
}

/**
 * Attempts to unpack the value by decoding it. Make sure to call, `canUnpack`
 * before calling this method
 */
export function unpack (encodedValue: string): null | any {
  const verified = new MessageBuilder().verify(base64.urlDecode(encodedValue, 'utf-8', true))
  return verified === undefined ? null : verified
}
