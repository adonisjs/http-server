/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import cookie from 'cookie'
import type { Encryption } from '@adonisjs/encryption'

import { CookieClient } from './client.ts'

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
  /**
   * Cookie client instance for handling cookie operations
   */
  #client: CookieClient

  /**
   * A copy of cached cookies, they are cached during a request after
   * initial decoding, unsigning or decrypting.
   */
  #cachedCookies: {
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
  #cookies: Record<string, any>

  /**
   * Create a new instance of CookieParser
   *
   * @param cookieHeader - The raw cookie header string from the request
   * @param encryption - The encryption instance for cookie operations
   */
  constructor(cookieHeader: string, encryption: Encryption) {
    this.#client = new CookieClient(encryption)
    this.#cookies = this.#parse(cookieHeader)
  }

  /**
   * Parses the request `cookie` header
   *
   * @param cookieHeader - The cookie header string to parse
   * @returns Parsed cookies as key-value pairs
   */
  #parse(cookieHeader?: string) {
    /*
     * Set to empty object when cookie header is empty string
     */
    if (!cookieHeader) {
      return {}
    }

    /*
     * Parse and store reference
     */
    return cookie.parse(cookieHeader)
  }

  /**
   * Attempts to decode a cookie by the name. When calling this method,
   * you are assuming that the cookie was just stringified in the first
   * place and not signed or encrypted.
   *
   * @param key - The cookie key to decode
   * @param stringified - Whether the cookie value was stringified
   * @returns The decoded cookie value or null if decoding fails
   */
  decode(key: string, stringified = true): any | null {
    /*
     * Ignore when initial value is not defined or null
     */
    const value = this.#cookies[key]
    if (value === null || value === undefined) {
      return null
    }

    /*
     * Reference to the cache object. Mainly done to avoid typos,
     * since this object is referenced a handful of times inside
     * this method.
     */
    const cache = this.#cachedCookies.plainCookies

    /*
     * Return from cache, when already parsed
     */
    if (cache[key] !== undefined) {
      return cache[key]
    }

    /*
     * Attempt to unpack and cache it for future. The value is only
     * when value it is not null.
     */
    const parsed = this.#client.decode(key, value, stringified)
    if (parsed !== null) {
      cache[key] = parsed
    }

    return parsed
  }

  /**
   * Attempts to unsign a cookie by the name. When calling this method,
   * you are assuming that the cookie was signed in the first place.
   *
   * @param key - The cookie key to unsign
   * @returns The original cookie value or null if unsigning fails
   */
  unsign(key: string): null | any {
    /*
     * Ignore when initial value is not defined or null
     */
    const value = this.#cookies[key]
    if (value === null || value === undefined) {
      return null
    }

    /*
     * Reference to the cache object. Mainly done to avoid typos,
     * since this object is referenced a handful of times inside
     * this method.
     */
    const cache = this.#cachedCookies.signedCookies

    /*
     * Return from cache, when already parsed
     */
    if (cache[key] !== undefined) {
      return cache[key]
    }

    /*
     * Attempt to unpack and cache it for future. The value is only
     * when value it is not null.
     */
    const parsed = this.#client.unsign(key, value)
    if (parsed !== null) {
      cache[key] = parsed
    }

    return parsed
  }

  /**
   * Attempts to decrypt a cookie by the name. When calling this method,
   * you are assuming that the cookie was encrypted in the first place.
   *
   * @param key - The cookie key to decrypt
   * @returns The decrypted cookie value or null if decryption fails
   */
  decrypt(key: string): null | any {
    /*
     * Ignore when initial value is not defined or null
     */
    const value = this.#cookies[key]
    if (value === null || value === undefined) {
      return null
    }

    /*
     * Reference to the cache object. Mainly done to avoid typos,
     * since this object is referenced a handful of times inside
     * this method.
     */
    const cache = this.#cachedCookies.encryptedCookies

    /*
     * Return from cache, when already parsed
     */
    if (cache[key] !== undefined) {
      return cache[key]
    }

    /*
     * Attempt to unpack and cache it for future. The value is only
     * when value it is not null.
     */
    const parsed = this.#client.decrypt(key, value)
    if (parsed !== null) {
      cache[key] = parsed
    }

    return parsed
  }

  /**
   * Returns an object of cookies key-value pair. Do note, the
   * cookies are not decoded, unsigned or decrypted inside this
   * list.
   *
   * @returns Raw cookies as key-value pairs
   */
  list() {
    return this.#cookies
  }
}
