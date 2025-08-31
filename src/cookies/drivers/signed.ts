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
 * Signs a value to be shared as a cookie. The signed output has a
 * hash to verify tampering with the original value
 * 
 * @param key - The cookie key used for signing
 * @param value - The value to sign
 * @param encryption - The encryption instance
 * @returns The signed cookie string or null if value is null/undefined
 */
export function pack(key: string, value: any, encryption: Encryption): null | string {
  if (value === undefined || value === null) {
    return null
  }
  return `s:${encryption.verifier.sign(value, undefined, key)}`
}

/**
 * Returns a boolean, if the unpack method from this module can attempt
 * to unpack the signed value.
 * 
 * @param signedValue - The signed value to check
 * @returns True if the value can be unpacked by this module
 */
export function canUnpack(signedValue: string) {
  return typeof signedValue === 'string' && signedValue.substring(0, 2) === 's:'
}

/**
 * Attempts to unpack the signed value. Make sure to call `canUnpack` before
 * calling this method.
 * 
 * @param key - The cookie key used for verification
 * @param signedValue - The signed value to verify and unpack
 * @param encryption - The encryption instance
 * @returns The original value or null if verification fails
 */
export function unpack(key: string, signedValue: string, encryption: Encryption): null | any {
  const value = signedValue.slice(2)
  if (!value) {
    return null
  }

  return encryption.verifier.unsign(value, key)
}
