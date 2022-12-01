/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Shape of the request config
 */
export type RequestConfig = {
  forceContentNegotiationTo?: string | ((ctx: any) => string)
  subdomainOffset: number
  generateRequestId: boolean
  allowMethodSpoofing: boolean
  getIp?: (request: any) => string
  trustProxy: (address: string, distance: number) => boolean
  useAsyncLocalStorage?: boolean
}
