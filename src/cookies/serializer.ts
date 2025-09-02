/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Encryption } from '@adonisjs/encryption'

import { CookieClient } from './client.ts'
import { serializeCookie } from '../helpers.ts'
import type { CookieOptions } from '../types/response.ts'

/**
 * Cookies serializer is used to serialize a value to be set on the `Set-Cookie`
 * header. You can `encode`, `sign` on `encrypt` cookies using the serializer
 * and then set them individually using the `set-cookie` header.
 */
export class CookieSerializer {
  /**
   * Cookie client instance for handling cookie operations
   */
  #client: CookieClient

  /**
   * Create a new instance of CookieSerializer
   *
   * @param encryption - The encryption instance for cookie operations
   */
  constructor(encryption: Encryption) {
    this.#client = new CookieClient(encryption)
  }

  /**
   * Encodes value as a plain cookie. By default, the plain value will be converted
   * to a string using "JSON.stringify" method and then encoded as a base64 string.
   *
   * You can disable cookie stringifaction by setting `options.stringify = false`.
   *
   * ```ts
   *  serializer.encode('name', 'virk')
   *  serializer.encode('name', 'virk', { stringify: false })
   * ```
   *
   * @param key - The cookie key
   * @param value - The value to encode
   * @param options - Cookie encoding options
   * @returns The serialized cookie string or null if encoding fails
   */
  encode(
    key: string,
    value: any,
    options?: Partial<
      CookieOptions & {
        /**
         * @depreacted Instead use stringify option
         */
        encode: boolean
        stringify: boolean
      }
    >
  ): string | null {
    const stringify = options?.stringify ?? options?.encode
    const packedValue = this.#client.encode(key, value, stringify)
    if (packedValue === null || packedValue === undefined) {
      return null
    }

    return serializeCookie(key, packedValue, options)
  }

  /**
   * Sign a key-value pair to a signed cookie. The signed value has a
   * verification hash attached to it to detect data tampering.
   *
   * @param key - The cookie key
   * @param value - The value to sign
   * @param options - Cookie options
   * @returns The serialized signed cookie string or null if signing fails
   */
  sign(key: string, value: any, options?: Partial<CookieOptions>): string | null {
    const packedValue = this.#client.sign(key, value)
    if (packedValue === null) {
      return null
    }

    return serializeCookie(key, packedValue, options)
  }

  /**
   * Encrypts a key-value pair to an encrypted cookie.
   *
   * @param key - The cookie key
   * @param value - The value to encrypt
   * @param options - Cookie options
   * @returns The serialized encrypted cookie string or null if encryption fails
   */
  encrypt(key: string, value: any, options?: Partial<CookieOptions>): string | null {
    const packedValue = this.#client.encrypt(key, value)
    if (packedValue === null) {
      return null
    }

    return serializeCookie(key, packedValue, options)
  }
}
