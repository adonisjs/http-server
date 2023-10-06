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
  /**
   * URL segments to ignore when extracting subdomains from a URL.
   * Defaults to 2
   */
  subdomainOffset: number

  /**
   * Enabling the flag will generated a unique request id from every
   * HTTP request.
   *
   * The request id can be accessed using the "request.id()" method. Also,
   * the value of `x-request-id` header is used as the id (if it exists).
   *
   * Defaults to false
   */
  generateRequestId: boolean

  /**
   * Method spoofing allows changing the request method using the query string.
   * For example: Making a POST request on URL /users/1?_method=PATCH will
   * be handled by the patch route.
   *
   * Defaults to false
   */
  allowMethodSpoofing: boolean

  /**
   * A custom implementation to get the request ip address
   */
  getIp?: (request: any) => string

  /**
   * A callback function to trust proxy ip addresses. You must use
   * the `proxy-addr` package to compute this value.
   *
   * Defaults to: "proxyAddr.compile('loopback')"
   */
  trustProxy: ((address: string, distance: number) => boolean) | (() => boolean)
}
