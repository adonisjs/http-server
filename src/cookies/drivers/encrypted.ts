/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Encryption } from '@adonisjs/encryption'

/**
 * Encrypt a value to be set as cookie
 */
export function pack(key: string, value: any, encryption: Encryption): null | string {
  if (value === undefined || value === null) {
    return null
  }
  return `e:${encryption.encrypt(value, undefined, key)}`
}

/**
 * Returns a boolean, if the unpack method from this module can attempt
 * to unpack encrypted value.
 */
export function canUnpack(encryptedValue: string) {
  return typeof encryptedValue === 'string' && encryptedValue.substring(0, 2) === 'e:'
}

/**
 * Attempts to unpack the encrypted cookie value. Returns null, when fails to do so.
 * Only call this method, when `canUnpack` returns true, otherwise runtime
 * exceptions can be raised.
 */
export function unpack(key: string, encryptedValue: string, encryption: Encryption): null | any {
  const value = encryptedValue.slice(2)
  if (!value) {
    return null
  }

  return encryption.decrypt(value, key)
}
