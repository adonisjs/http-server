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
import lodash from '@poppinss/utils/lodash'
import { safeStringify } from '@poppinss/utils/json'
import { type DeepPartial } from '@poppinss/utils/types'

import type { ServerConfig } from './types/server.ts'

type UserDefinedServerConfig = DeepPartial<
  Omit<ServerConfig, 'trustProxy'> & {
    trustProxy: ((address: string, distance: number) => boolean) | boolean | string
  }
>

/**
 * Define configuration for the HTTP server with sensible defaults.
 *
 * This function merges user-provided configuration with default values,
 * normalizes certain properties (like cookie maxAge and trustProxy settings),
 * and returns a complete ServerConfig object.
 *
 * @param config - User-defined server configuration options
 *
 * @example
 * ```ts
 * const config = defineConfig({
 *   trustProxy: true,
 *   cookie: {
 *     maxAge: '7d',
 *     secure: false
 *   },
 *   etag: true
 * })
 * ```
 */
export function defineConfig(config: UserDefinedServerConfig): ServerConfig {
  const { trustProxy, ...rest } = config

  const defaults = {
    allowMethodSpoofing: false,
    trustProxy: proxyAddr.compile('loopback'),
    subdomainOffset: 2,
    generateRequestId: !!config.createRequestId,
    createRequestId() {
      return crypto.randomUUID()
    },
    serializeJSON: safeStringify,
    useAsyncLocalStorage: false,
    etag: false,
    jsonpCallbackName: 'callback',
    cookie: {
      maxAge: '2h',
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax' as const,
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
  } satisfies ServerConfig

  const normalizedConfig: ServerConfig = lodash.merge({}, defaults, rest)

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
  } else if (trustProxy) {
    normalizedConfig.trustProxy = trustProxy
  }

  return normalizedConfig
}
