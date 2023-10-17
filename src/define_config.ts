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

type UserDefinedServerConfig = Partial<
  Omit<ServerConfig, 'trustProxy'> & {
    trustProxy: ((address: string, distance: number) => boolean) | boolean | string
  }
>

/**
 * Define configuration for the HTTP server
 */
export function defineConfig(config: UserDefinedServerConfig): ServerConfig {
  const { trustProxy, ...rest } = config

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
    qs: {
      parse: {
        depth: 5,
        parameterLimit: 1000,
        allowSparse: false,
        arrayLimit: 20,
        comma: true,
      },
      stringify: {
        encode: true,
        encodeValuesOnly: false,
        arrayFormat: 'indices' as const,
        skipNulls: false,
      },
    },
    ...rest,
  }

  /**
   * Normalizing maxAge property on cookies to be a number in
   * seconds
   */
  if (normalizedConfig.cookie.maxAge) {
    normalizedConfig.cookie.maxAge = string.seconds.parse(normalizedConfig.cookie.maxAge)
  }

  /**
   * Normalizing trust proxy setting to allow boolean and
   * string values
   */
  if (typeof trustProxy === 'boolean') {
    const tpValue = trustProxy
    normalizedConfig.trustProxy = (_, __) => tpValue
  } else if (typeof trustProxy === 'string') {
    const tpValue = trustProxy
    normalizedConfig.trustProxy = proxyAddr.compile(tpValue)
  }

  return normalizedConfig
}
