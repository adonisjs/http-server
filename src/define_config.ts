/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import proxyAddr from 'proxy-addr'
import type { RequestConfig } from './types/request.js'
import type { ResponseConfig } from './types/response.js'

/**
 * Define configuration for the HTTP server
 */
export function defineConfig(
  config: Partial<RequestConfig & ResponseConfig>
): RequestConfig & ResponseConfig {
  return {
    allowMethodSpoofing: false,
    trustProxy: proxyAddr.compile('loopback'),
    subdomainOffset: 2,
    generateRequestId: false,
    useAsyncLocalStorage: false,
    etag: false,
    jsonpCallbackName: 'callback',
    cookie: {
      maxAge: '2h',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: false,
    },
    ...config,
  }
}
