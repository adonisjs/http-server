/*
 * @adonisjs/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import proxyaddr from 'proxy-addr'
import { Profiler } from '@adonisjs/profiler'
import { FakeLogger } from '@adonisjs/logger'
import { ServerConfig } from '@ioc:Adonis/Core/Server'
import { RequestConfig } from '@ioc:Adonis/Core/Request'
import { ResponseConfig } from '@ioc:Adonis/Core/Response'
import { Encryption } from '@adonisjs/encryption/build/standalone'

export const appSecret = 'averylongrandom32charslongsecret'

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

export const logger = new FakeLogger(loggerConfig)
export const profiler = new Profiler(__dirname, logger, { enabled: false })
export const encryption = new Encryption({ secret: appSecret })
