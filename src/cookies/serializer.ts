/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import cookie from 'cookie'
import string from '@poppinss/utils/string'
import type { Encryption } from '@adonisjs/encryption'

import { CookieClient } from './client.js'
import type { CookieOptions } from '../types/response.js'

/**
 * Cookies serializer is used to serialize a value to be set on the `Set-Cookie`
 * header. You can `encode`, `sign` on `encrypt` cookies using the serializer
 * and then set them individually using the `set-cookie` header.
 */
export class CookieSerializer {
  #client: CookieClient

  constructor(encryption: Encryption) {
    this.#client = new CookieClient(encryption)
  }

  /**
   * Serializes the key-value pair to a string, that can be set on the
   * `Set-Cookie` header.
   */
  #serializeAsCookie(key: string, value: string, options?: Partial<CookieOptions>) {
    /**
     * Invoked expires method to get the date
     */
    let expires = options?.expires
    if (typeof expires === 'function') {
      expires = expires()
    }

    /**
     * Parse string based max age to seconds
     */
    let maxAge = options?.maxAge ? string.seconds.parse(options?.maxAge) : undefined

    const parsedOptions = Object.assign({}, options, { maxAge, expires })
    return cookie.serialize(key, value, parsedOptions)
  }

  /**
   * Encodes value as a plain cookie. By default, the plain value will be converted
   * to a string using "JSON.stringify" method and then encoded as a base64 string.
   *
   * You can disable encoding of the cookie by setting `options.encoded = false`.
   *
   * ```ts
   *  serializer.encode('name', 'virk')
   * ```
   */
  encode(
    key: string,
    value: any,
    options?: Partial<CookieOptions & { encode: boolean }>
  ): string | null {
    const packedValue = options?.encode === false ? value : this.#client.encode(key, value)
    if (packedValue === null || packedValue === undefined) {
      return null
    }

    return this.#serializeAsCookie(key, packedValue, options)
  }

  /**
   * Sign a key-value pair to a signed cookie. The signed value has a
   * verification hash attached to it to detect data tampering.
   */
  sign(key: string, value: any, options?: Partial<CookieOptions>): string | null {
    const packedValue = this.#client.sign(key, value)
    if (packedValue === null) {
      return null
    }

    return this.#serializeAsCookie(key, packedValue, options)
  }

  /**
   * Encrypts a key-value pair to an encrypted cookie.
   */
  encrypt(key: string, value: any, options?: Partial<CookieOptions>): string | null {
    const packedValue = this.#client.encrypt(key, value)
    if (packedValue === null) {
      return null
    }

    return this.#serializeAsCookie(key, packedValue, options)
  }
}
