/*
* @poppinss/cookie
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { EncryptionContract } from '@ioc:Adonis/Core/Encryption'

export function pack (key: string, value: any, encryption: EncryptionContract): null | string {
  if (value === undefined || value === null) {
    return null
  }
  return `s:${encryption.verifier.sign(value, undefined, key)}`
}

export function canUnpack (signedValue: string) {
  return typeof signedValue === 'string' && signedValue.substr(0, 2) === 's:'
}

export function unpack (key: string, signedValue: string, encryption: EncryptionContract): null | any {
  /**
   * Ensure value exists after removing s: prefix
   */
  const value = signedValue.slice(2)
  if (!value) {
    return null
  }

  /**
   * Decrypt
   */
  return encryption.verifier.unsign(value, key)
}
