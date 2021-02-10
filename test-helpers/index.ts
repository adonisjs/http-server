/*
 * @adonisjs/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'path'
import proxyaddr from 'proxy-addr'
import { Filesystem } from '@poppinss/dev-utils'
import { Application } from '@adonisjs/application'
import { ServerConfig } from '@ioc:Adonis/Core/Server'
import { RequestConfig } from '@ioc:Adonis/Core/Request'
import { ResponseConfig } from '@ioc:Adonis/Core/Response'
import { Encryption } from '@adonisjs/encryption/build/standalone'

export const appSecret = 'averylongrandom32charslongsecret'
export const fs = new Filesystem(join(__dirname, './app'))

export const loggerConfig = {
  name: 'http-server',
  enabled: true,
  level: 'debug',
}

export const requestConfig: RequestConfig = {
  allowMethodSpoofing: false,
  trustProxy: proxyaddr.compile('loopback'),
  subdomainOffset: 2,
  generateRequestId: true,
}

export const responseConfig: ResponseConfig = {
  etag: false,
  jsonpCallbackName: 'callback',
  cookie: {
    maxAge: 90,
    path: '/',
    httpOnly: true,
    sameSite: false,
    secure: false,
  },
}

export const serverConfig: ServerConfig = Object.assign({}, requestConfig, responseConfig)
export const encryption = new Encryption({ secret: appSecret })

export async function setupApp(providers?: string[]) {
  const app = new Application(fs.basePath, 'web', {
    providers: providers || [],
  })

  await fs.add('.env', '')
  await fs.add(
    'config/app.ts',
    `
		export const appKey = '${appSecret}'
		export const http = {
			trustProxy: () => true,
			cookie: {}
		}
	`
  )

  app.setup()
  app.registerProviders()
  await app.bootProviders()

  return app
}
