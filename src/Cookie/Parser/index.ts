/**
 * @adonisjs/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import cookie from 'cookie'
import { EncryptionContract } from '@ioc:Adonis/Core/Encryption'

import { CookieClient } from '../Client'

/**
 * Cookie parser parses the HTTP `cookie` header and collects all cookies
 * inside an object of `key-value` pair, but doesn't attempt to decrypt
 * or unsign or decode the individual values.
 *
 * The cookie values are lazily decrypted, or unsigned to avoid unncessary
 * processing, which infact can be used as a means to burden the server
 * by sending too many cookies which even doesn't belongs to the
 * server.
 */
export class CookieParser {
  private client = new CookieClient(this.encryption)

  /**
   * A copy of cached cookies, they are cached during a request after
   * initial decoding, unsigning or decrypting.
   */
  private cachedCookies: {
    encryptedCookies: Record<string, any>
    signedCookies: Record<string, any>
    plainCookies: Record<string, any>
  } = {
    signedCookies: {},
    plainCookies: {},
    encryptedCookies: {},
  }

  /**
   * An object of key-value pair collected by parsing
   * the request cookie header.
   */
  private cookies: Record<string, any> = this.parse()

  constructor(private cookieHeader: string, private encryption: EncryptionContract) {}

  /**
   * Parses the request `cookie` header
   */
  private parse() {
    /*
     * Set to empty object when cookie header is empty string
     */
    if (!this.cookieHeader) {
      return {}
    }

    /*
     * Parse and store reference
     */
    return cookie.parse(this.cookieHeader)
  }

  /**
   * Attempts to decode a cookie by the name. When calling this method,
   * you are assuming that the cookie was just encoded at the first
   * place and not signed or encrypted.
   */
  public decode(key: string, encoded = true): any | null {
    /*
     * Ignore when initial value is not defined or null
     */
    const value = this.cookies![key]
    if (value === null || value === undefined) {
      return null
    }

    /*
     * Reference to the cache object. Mainly done to avoid typos,
     * since this object is referenced a handful of times inside
     * this method.
     */
    const cacheObject = this.cachedCookies.plainCookies

    /*
     * Return from cache, when already parsed
     */
    if (cacheObject[key] !== undefined) {
      return cacheObject[key]
    }

    /*
     * Attempt to unpack and cache it for future. The value is only
     * when value it is not null.
     */
    const parsed = encoded ? this.client.decode(key, value) : value
    if (parsed !== null) {
      cacheObject[key] = parsed
    }

    return parsed
  }

  /**
   * Attempts to unsign a cookie by the name. When calling this method,
   * you are assuming that the cookie was signed at the first place.
   */
  public unsign(key: string): null | any {
    /*
     * Ignore when initial value is not defined or null
     */
    const value = this.cookies![key]
    if (value === null || value === undefined) {
      return null
    }

    /*
     * Reference to the cache object. Mainly done to avoid typos,
     * since this object is referenced a handful of times inside
     * this method.
     */
    const cacheObject = this.cachedCookies.signedCookies

    /*
     * Return from cache, when already parsed
     */
    if (cacheObject[key] !== undefined) {
      return cacheObject[key]
    }

    /*
     * Attempt to unpack and cache it for future. The value is only
     * when value it is not null.
     */
    const parsed = this.client.unsign(key, value)
    if (parsed !== null) {
      cacheObject[key] = parsed
    }

    return parsed
  }

  /**
   * Attempts to decrypt a cookie by the name. When calling this method,
   * you are assuming that the cookie was encrypted at the first place.
   */
  public decrypt(key: string): null | any {
    /*
     * Ignore when initial value is not defined or null
     */
    const value = this.cookies![key]
    if (value === null || value === undefined) {
      return null
    }

    /*
     * Reference to the cache object. Mainly done to avoid typos,
     * since this object is referenced a handful of times inside
     * this method.
     */
    const cacheObject = this.cachedCookies.encryptedCookies

    /*
     * Return from cache, when already parsed
     */
    if (cacheObject[key] !== undefined) {
      return cacheObject[key]
    }

    /*
     * Attempt to unpack and cache it for future. The value is only
     * when value it is not null.
     */
    const parsed = this.client.decrypt(key, value)
    if (parsed !== null) {
      cacheObject[key] = parsed
    }

    return parsed
  }

  /**
   * Returns an object of cookies key-value pair. Do note, the
   * cookies are not decoded, unsigned or decrypted inside this
   * list.
   */
  public list() {
    return this.cookies
  }
}
