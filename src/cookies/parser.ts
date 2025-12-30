/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { parse } from 'cookie-es'
import type { Encryption } from '@boringnode/encryption'

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
    return parse(cookieHeader)
  }

  /**
   * Generic method to get a cookie value from cache or parse it.
   * This method handles the common pattern of checking the cache,
   * parsing the value if not cached, and caching the result.
   *
   * @param key - The cookie key to lookup
   * @param cacheKey - The cache bucket to use
   * @param parser - Function to parse the raw cookie value
   * @returns The parsed cookie value or null if parsing fails
   */
  #getCachedOrParse(
    key: string,
    cacheKey: 'plainCookies' | 'signedCookies' | 'encryptedCookies',
    parser: (value: string) => any | null
  ): any | null {
    const value = this.#cookies[key]
    if (value === null || value === undefined) {
      return null
    }

    const cache = this.#cachedCookies[cacheKey]
    if (cache[key] !== undefined) {
      return cache[key]
    }

    const parsed = parser(value)
    if (parsed !== null) {
      cache[key] = parsed
    }

    return parsed
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
    return this.#getCachedOrParse(key, 'plainCookies', (value) =>
      this.#client.decode(key, value, stringified)
    )
  }

  /**
   * Attempts to unsign a cookie by the name. When calling this method,
   * you are assuming that the cookie was signed in the first place.
   *
   * @param key - The cookie key to unsign
   * @returns The original cookie value or null if unsigning fails
   */
  unsign(key: string): null | any {
    return this.#getCachedOrParse(key, 'signedCookies', (value) => this.#client.unsign(key, value))
  }

  /**
   * Attempts to decrypt a cookie by the name. When calling this method,
   * you are assuming that the cookie was encrypted in the first place.
   *
   * @param key - The cookie key to decrypt
   * @returns The decrypted cookie value or null if decryption fails
   */
  decrypt(key: string): null | any {
    return this.#getCachedOrParse(key, 'encryptedCookies', (value) =>
      this.#client.decrypt(key, value)
    )
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
