/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import base64 from '@poppinss/utils/base64'
import { MessageBuilder } from '@poppinss/utils'

/**
 * Encodes a value into a base64 url encoded string to
 * be set as cookie
 * 
 * @param value - The value to encode
 * @returns The encoded cookie string or null if value is null/undefined
 */
export function pack(value: any): null | string {
  if (value === undefined || value === null) {
    return null
  }
  return base64.urlEncode(new MessageBuilder().build(value))
}

/**
 * Returns true when this `unpack` method of this module can attempt
 * to unpack the encode value.
 * 
 * @param encodedValue - The encoded value to check
 * @returns True if the value can be unpacked by this module
 */
export function canUnpack(encodedValue: string) {
  return typeof encodedValue === 'string'
}

/**
 * Attempts to unpack the value by decoding it. Make sure to call, `canUnpack`
 * before calling this method
 * 
 * @param encodedValue - The encoded value to decode
 * @returns The decoded value or null if decoding fails
 */
export function unpack(encodedValue: string): null | any {
  return new MessageBuilder().verify(base64.urlDecode(encodedValue, 'utf-8', false))
}
