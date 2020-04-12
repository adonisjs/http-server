/*
 * @poppinss/cookie
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import cookie from 'cookie'
import { EncryptionContract } from '@ioc:Adonis/Core/Encryption'

import * as PlainCookie from '../Drivers/Plain'
import * as SignedCookie from '../Drivers/Signed'
import * as EncryptedCookie from '../Drivers/Encrypted'

export class CookieParser {
  private cachedCookies: {
    encryptedCookies: { [key: string]: any },
    signedCookies: { [key: string]: any },
    plainCookies: { [key: string]: any },
  } = {
    signedCookies: {},
    plainCookies: {},
    encryptedCookies: {},
  }

  private cookies: { [key: string]: any } = this.parse()

  constructor (private cookieHeader: string, private encryption: EncryptionContract) {}

  private parse () {
    /**
     * Set to empty object when cookie header is empty string
     */
    if (!this.cookieHeader) {
      return {}
    }

    /**
     * Parse and store reference
     */
    return cookie.parse(this.cookieHeader)
  }

  public decode (key: string) {
    /**
     * Ignore when initial value is not defined or null
     */
    const value = this.cookies![key]
    if (value === null || value === undefined) {
      return null
    }

    /**
     * Return from cache, when already parsed
     */
    if (this.cachedCookies.plainCookies[key] !== undefined) {
      return this.cachedCookies.plainCookies[key]
    }

    /**
     * Attempt to unpack and cache it for future. The value is only
     * when value it is not null.
     */
    const parsed = PlainCookie.canUnpack(value) ? PlainCookie.unpack(value) : null
    if (parsed !== null) {
      this.cachedCookies.plainCookies[key] = parsed
    }

    return parsed
  }

  public unsign (key: string) {
    /**
     * Ignore when initial value is not defined or null
     */
    const value = this.cookies![key]
    if (value === null || value === undefined) {
      return null
    }

    /**
     * Return from cache, when already parsed
     */
    if (this.cachedCookies.signedCookies[key] !== undefined) {
      return this.cachedCookies.signedCookies[key]
    }

    /**
     * Attempt to unpack and cache it for future. The value is only
     * when value it is not null.
     */
    const parsed = SignedCookie.canUnpack(value) ? SignedCookie.unpack(key, value, this.encryption) : null
    if (parsed !== null) {
      this.cachedCookies.signedCookies[key] = parsed
    }

    return parsed
  }

  public decrypt (key: string) {
    /**
     * Ignore when initial value is not defined or null
     */
    const value = this.cookies![key]
    if (value === null || value === undefined) {
      return null
    }

    /**
     * Return from cache, when already parsed
     */
    if (this.cachedCookies.encryptedCookies[key] !== undefined) {
      return this.cachedCookies.encryptedCookies[key]
    }

    /**
     * Attempt to unpack and cache it for future. The value is only
     * when value it is not null.
     */
    const parsed = EncryptedCookie.canUnpack(value)
      ? EncryptedCookie.unpack(key, value, this.encryption)
      : null

    if (parsed !== null) {
      this.cachedCookies.encryptedCookies[key] = parsed
    }

    return parsed
  }

  public list () {
    return this.cookies
  }
}
