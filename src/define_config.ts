/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import proxyAddr from 'proxy-addr'
import string from '@poppinss/utils/string'
import type { ServerConfig } from './types/server.js'

/**
 * Define configuration for the HTTP server
 */
export function defineConfig(config: Partial<ServerConfig>): ServerConfig {
  const normalizedConfig = {
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

  if (normalizedConfig.cookie.maxAge) {
    normalizedConfig.cookie.maxAge = string.seconds.parse(normalizedConfig.cookie.maxAge)
  }

  return normalizedConfig
}
