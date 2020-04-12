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
  return `e:${encryption.encrypt(value, undefined, key)}`
}

export function canUnpack (encryptedValue: string) {
  return typeof encryptedValue === 'string' && encryptedValue.substr(0, 2) === 'e:'
}

export function unpack (key: string, encryptedValue: string, encryption: EncryptionContract): null | any {
  const value = encryptedValue.slice(2)
  if (!value) {
    return null
  }

  return encryption.decrypt(value, key)
}
