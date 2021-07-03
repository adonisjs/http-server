/**
 * @adonisjs/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import ms from 'ms'
import cookie, { CookieSerializeOptions } from 'cookie'
import { CookieOptions } from '@ioc:Adonis/Core/Response'
import { EncryptionContract } from '@ioc:Adonis/Core/Encryption'

import { CookieClient } from '../Client'

/**
 * Cookies serializer is used to serialize a value to be set on the `Set-Cookie`
 * header. You can `encode`, `sign` on `encrypt` cookies using the serializer
 * and then set them individually using the `set-cookie` header.
 */
export class CookieSerializer {
  private client = new CookieClient(this.encryption)

  constructor(private encryption: EncryptionContract) {}

  /**
   * Serializes the key-value pair to a string, that can be set on the
   * `Set-Cookie` header.
   */
  private serializeAsCookie(key: string, value: string, options?: Partial<CookieOptions>) {
    /**
     * Invoked expires method to get the date
     */
    let expires = options?.expires
    if (typeof expires === 'function') {
      expires = expires()
    }

    /**
     * Parse string based max age to number
     */
    let maxAge = options?.maxAge
    if (typeof maxAge === 'string') {
      maxAge = ms(maxAge) / 1000
    }

    const parsedOptions = Object.assign({}, options, { maxAge, expires }) as CookieSerializeOptions
    return cookie.serialize(key, value, parsedOptions)
  }

  /**
   * Encodes value as a plain cookie. Do note, the value is still JSON.stringified
   * and converted to base64 encoded string to avoid encoding issues.
   *
   * @example
   * ```ts
   *  serializer.encode('name', 'virk')
   * ```
   */
  public encode(key: string, value: any, options?: Partial<CookieOptions>): string | null {
    const packedValue = this.client.encode(key, value)
    if (packedValue === null) {
      return null
    }

    return this.serializeAsCookie(key, packedValue, options)
  }

  /**
   * Signs the value and returns it back as a url safe string. The signed value
   * has a verification hash attached to it to detect data tampering.
   */
  public sign(key: string, value: any, options?: Partial<CookieOptions>): string | null {
    const packedValue = this.client.sign(key, value)
    if (packedValue === null) {
      return null
    }

    return this.serializeAsCookie(key, packedValue, options)
  }

  /**
   * Encrypts the value and returns it back as a url safe string.
   */
  public encrypt(key: string, value: any, options?: Partial<CookieOptions>): string | null {
    const packedValue = this.client.encrypt(key, value)
    if (packedValue === null) {
      return null
    }

    return this.serializeAsCookie(key, packedValue, options)
  }
}
