/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Encryption } from '@adonisjs/encryption'

import * as plainCookiesDriver from './drivers/plain.ts'
import * as signedCookiesDriver from './drivers/signed.ts'
import * as encryptedCookiesDriver from './drivers/encrypted.ts'

/**
 * Cookie client exposes the API to parse/set AdonisJS cookies
 * as a client.
 */
export class CookieClient {
  /**
   * Private encryption instance used for signing and encrypting cookies
   */
  #encryption: Encryption

  /**
   * Create a new instance of CookieClient
   * 
   * @param encryption - The encryption instance for cookie operations
   */
  constructor(encryption: Encryption) {
    this.#encryption = encryption
  }

  /**
   * Encrypt a key value pair to be sent in the cookie header
   * 
   * @param key - The cookie key
   * @param value - The value to encrypt
   * @returns The encrypted cookie string or null if encryption fails
   */
  encrypt(key: string, value: any): string | null {
    return encryptedCookiesDriver.pack(key, value, this.#encryption)
  }

  /**
   * Sign a key value pair to be sent in the cookie header
   * 
   * @param key - The cookie key
   * @param value - The value to sign
   * @returns The signed cookie string or null if signing fails
   */
  sign(key: string, value: any): string | null {
    return signedCookiesDriver.pack(key, value, this.#encryption)
  }

  /**
   * Encode a key value pair to be sent in the cookie header
   * 
   * @param _ - Unused key parameter
   * @param value - The value to encode
   * @param stringify - Whether to stringify the value before encoding
   * @returns The encoded cookie string or null if encoding fails
   */
  encode(_: string, value: any, stringify: boolean = true): string | null {
    return stringify ? plainCookiesDriver.pack(value) : value
  }

  /**
   * Unsign a signed cookie value
   * 
   * @param key - The cookie key
   * @param value - The signed cookie value to unsign
   * @returns The original value if valid signature, null otherwise
   */
  unsign(key: string, value: string) {
    return signedCookiesDriver.canUnpack(value)
      ? signedCookiesDriver.unpack(key, value, this.#encryption)
      : null
  }

  /**
   * Decrypt an encrypted cookie value
   * 
   * @param key - The cookie key
   * @param value - The encrypted cookie value to decrypt
   * @returns The decrypted value or null if decryption fails
   */
  decrypt(key: string, value: string) {
    return encryptedCookiesDriver.canUnpack(value)
      ? encryptedCookiesDriver.unpack(key, value, this.#encryption)
      : null
  }

  /**
   * Decode an encoded cookie value
   * 
   * @param _ - Unused key parameter
   * @param value - The encoded cookie value to decode
   * @param stringified - Whether the value was stringified during encoding
   * @returns The decoded value or null if decoding fails
   */
  decode(_: string, value: string, stringified: boolean = true) {
    if (!stringified) {
      return value
    }
    return plainCookiesDriver.canUnpack(value) ? plainCookiesDriver.unpack(value) : null
  }

  /**
   * Parse response cookie
   * 
   * @param key - The cookie key
   * @param value - The cookie value to parse
   * @returns The parsed value or undefined if parsing fails
   */
  parse(key: string, value: any) {
    /**
     * Unsign signed cookie
     */
    if (signedCookiesDriver.canUnpack(value)) {
      return signedCookiesDriver.unpack(key, value, this.#encryption)
    }

    /**
     * Decrypted encrypted cookie
     */
    if (encryptedCookiesDriver.canUnpack(value)) {
      return encryptedCookiesDriver.unpack(key, value, this.#encryption)
    }

    /**
     * Decode encoded cookie
     */
    if (plainCookiesDriver.canUnpack(value)) {
      return plainCookiesDriver.unpack(value)
    }
  }
}
