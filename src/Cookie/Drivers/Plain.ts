/*
* @poppinss/cookie
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { base64, MessageBuilder } from '@poppinss/utils'

export function pack (value: any): null | string {
  if (value === undefined || value === null) {
    return null
  }
  return base64.urlEncode(new MessageBuilder().build(value))
}

export function canUnpack (encodedValue: string) {
  return typeof encodedValue === 'string'
}

export function unpack (encodedValue: string): null | any {
  const verified = new MessageBuilder().verify(base64.urlDecode(encodedValue, 'utf-8', true))
  return verified === undefined ? null : verified
}
