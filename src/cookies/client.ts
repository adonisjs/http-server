/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type Encryption from '@adonisjs/encryption'

import * as plainCookiesDriver from './drivers/plain.js'
import * as signedCookiesDriver from './drivers/signed.js'
import * as encryptedCookiesDriver from './drivers/encrypted.js'

/**
 * Cookie client exposes the API to parse/set AdonisJS cookies
 * as a client.
 */
export class CookieClient {
  #encryption: Encryption

  constructor(encryption: Encryption) {
    this.#encryption = encryption
  }

  /**
   * Encrypt a key value pair to be sent in the cookie header
   */
  encrypt(key: string, value: any): string | null {
    return encryptedCookiesDriver.pack(key, value, this.#encryption)
  }

  /**
   * Sign a key value pair to be sent in the cookie header
   */
  sign(key: string, value: any): string | null {
    return signedCookiesDriver.pack(key, value, this.#encryption)
  }

  /**
   * Encode a key value pair to be sent in the cookie header
   */
  encode(_: string, value: any): string | null {
    return plainCookiesDriver.pack(value)
  }

  /**
   * Unsign a signed cookie value
   */
  unsign(key: string, value: string) {
    return signedCookiesDriver.canUnpack(value)
      ? signedCookiesDriver.unpack(key, value, this.#encryption)
      : null
  }

  /**
   * Decrypt an encrypted cookie value
   */
  decrypt(key: string, value: string) {
    return encryptedCookiesDriver.canUnpack(value)
      ? encryptedCookiesDriver.unpack(key, value, this.#encryption)
      : null
  }

  /**
   * Decode an encoded cookie value
   */
  decode(_: string, value: string) {
    return plainCookiesDriver.canUnpack(value) ? plainCookiesDriver.unpack(value) : null
  }

  /**
   * Parse response cookie
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
