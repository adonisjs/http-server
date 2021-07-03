/*
 * @adonisjs/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@ioc:Adonis/Core/CookieClient' {
  export interface CookieClientContract {
    /**
     * Encrypt a key value pair to be sent in the cookie header
     */
    encrypt(key: string, value: any): string | null

    /**
     * Sign a key value pair to be sent in the cookie header
     */
    sign(key: string, value: any): string | null

    /**
     * Encode a key value pair to be sent in the cookie header
     */
    encode(key: string, value: any): string | null

    /**
     * Parse the set-cookie header
     */
    parse(setCookieHeader: string): {
      name: string
      value: any
      encrypted: boolean
      signed: boolean
      path?: string
      expires?: Date
      maxAge?: number
      domain?: string
      secure?: boolean
      httpOnly?: boolean
      sameSite?: 'lax' | 'none' | 'strict'
    }[]

    /**
     * Unsign a signed cookie value
     */
    unsign(key: string, value: string): any

    /**
     * Decrypt an encrypted cookie value
     */
    decrypt(key: string, value: string): any

    /**
     * Decode an encoded cookie value
     */
    decode(key: string, value: string): any
  }

  const CookieClient: CookieClientContract
  export default CookieClient
}
