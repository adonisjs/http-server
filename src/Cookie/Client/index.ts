/*
 * @adonisjs/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../../../adonis-typings/index.ts" />

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
   * Parse response cookie
   */
  public parse(key: string, value: any) {
    /**
     * Unsign signed cookie
     */
    if (SignedCookie.canUnpack(value)) {
      return SignedCookie.unpack(key, value, this.encryption)
    }

    /**
     * Decrypted encrypted cookie
     */
    if (EncryptedCookie.canUnpack(value)) {
      return EncryptedCookie.unpack(key, value, this.encryption)
    }

    /**
     * Decode encoded cookie
     */
    if (PlainCookie.canUnpack(value)) {
      return PlainCookie.unpack(value)
    }
  }
}
