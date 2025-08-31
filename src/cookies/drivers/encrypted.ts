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
 *
 * @param key - The cookie key used for encryption
 * @param value - The value to encrypt
 * @param encryption - The encryption instance
 * @returns The encrypted cookie string or null if value is null/undefined
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
 *
 * @param encryptedValue - The encrypted value to check
 * @returns True if the value can be unpacked by this module
 */
export function canUnpack(encryptedValue: string) {
  return typeof encryptedValue === 'string' && encryptedValue.substring(0, 2) === 'e:'
}

/**
 * Attempts to unpack the encrypted cookie value. Returns null, when fails to do so.
 * Only call this method, when `canUnpack` returns true, otherwise runtime
 * exceptions can be raised.
 *
 * @param key - The cookie key used for decryption
 * @param encryptedValue - The encrypted value to decrypt
 * @param encryption - The encryption instance
 * @returns The decrypted value or null if decryption fails
 */
export function unpack(key: string, encryptedValue: string, encryption: Encryption): null | any {
  const value = encryptedValue.slice(2)
  if (!value) {
    return null
  }

  return encryption.decrypt(value, key)
}
