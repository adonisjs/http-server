/*
 * @adonisjs/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../../../adonis-typings/index.ts" />

import setCookieParser from 'set-cookie-parser'
import { EncryptionContract } from '@ioc:Adonis/Core/Encryption'
import { CookieClientContract } from '@ioc:Adonis/Core/CookieClient'

import * as PlainCookie from '../Drivers/Plain'
import * as SignedCookie from '../Drivers/Signed'
import * as EncryptedCookie from '../Drivers/Encrypted'

/**
 * Cookie client exposes the API to parse/set AdonisJS
 * cookies as a client.
 */
export class CookieClient implements CookieClientContract {
  constructor(private encryption: EncryptionContract) {}

  /**
   * Encrypt a key value pair to be sent in the cookie header
   */
  public encrypt(key: string, value: any): string | null {
    return EncryptedCookie.pack(key, value, this.encryption)
  }

  /**
   * Sign a key value pair to be sent in the cookie header
   */
  public sign(key: string, value: any): string | null {
    return SignedCookie.pack(key, value, this.encryption)
  }

  /**
   * Encode a key value pair to be sent in the cookie header
   */
  public encode(_: string, value: any): string | null {
    return PlainCookie.pack(value)
  }

  /**
   * Unsign a signed cookie value
   */
  public unsign(key: string, value: string) {
    return SignedCookie.canUnpack(value) ? SignedCookie.unpack(key, value, this.encryption) : null
  }

  /**
   * Decrypt an encrypted cookie value
   */
  public decrypt(key: string, value: string) {
    return EncryptedCookie.canUnpack(value)
      ? EncryptedCookie.unpack(key, value, this.encryption)
      : null
  }

  /**
   * Decode an encoded cookie value
   */
  public decode(_: string, value: string) {
    return PlainCookie.canUnpack(value) ? PlainCookie.unpack(value) : null
  }

  /**
   * Parses the set-cookie header and returns an
   * array of parsed cookies
   */
  public parse(setCookieHeader: string) {
    const cookies = setCookieParser(setCookieHeader)

    return cookies.map((cookie: any) => {
      cookie.encrypted = false
      cookie.signed = false
      const value = cookie.value

      /**
       * Unsign signed cookie
       */
      if (SignedCookie.canUnpack(value)) {
        cookie.value = SignedCookie.unpack(cookie.name, value, this.encryption)
        cookie.signed = true
        return cookie
      }

      /**
       * Decrypted encrypted cookie
       */
      if (EncryptedCookie.canUnpack(value)) {
        cookie.value = EncryptedCookie.unpack(cookie.name, value, this.encryption)
        cookie.encrypted = true
        return cookie
      }

      /**
       * Decode encoded cookie
       */
      if (PlainCookie.canUnpack(value)) {
        cookie.value = PlainCookie.unpack(value)
      }

      return cookie
    })
  }
}
