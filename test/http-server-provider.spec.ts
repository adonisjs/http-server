/*
 * @adonisjs/events
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'
import { join } from 'path'
import { Registrar, Ioc } from '@adonisjs/fold'
import { Config } from '@adonisjs/config/build/standalone'
import { Application } from '@adonisjs/application/build/standalone'

import { Router } from '../src/Router'
import { Server } from '../src/Server'
import { Request } from '../src/Request'
import { Response } from '../src/Response'
import { HttpContext } from '../src/HttpContext'
import { MiddlewareStore } from '../src/MiddlewareStore'
import { appSecret, serverConfig } from '../test-helpers'

test.group('Http Server Provider', () => {
	test('register http server provider', async (assert) => {
		const ioc = new Ioc()
		ioc.bind('Adonis/Core/Config', () => {
			return new Config({
				app: {
					http: serverConfig,
					appKey: appSecret,
					logger: {
						name: 'adonisjs',
						level: 'info',
						enabled: false,
					},
				},
			})
		})

		ioc.bind('Adonis/Core/Application', () => {
			return new Application(__dirname, ioc, {}, {})
		})

		const registrar = new Registrar(ioc, join(__dirname, '..'))

		await registrar
			.useProviders([
				'@adonisjs/logger',
				'@adonisjs/profiler',
				'@adonisjs/encryption',
				'./providers/HttpServerProvider',
			])
			.registerAndBoot()

		assert.instanceOf(ioc.use('Adonis/Core/Route'), Router)
		assert.deepEqual(ioc.use('Adonis/Core/Request'), Request)
		assert.deepEqual(ioc.use('Adonis/Core/Response'), Response)
		assert.instanceOf(ioc.use('Adonis/Core/Server'), Server)
		assert.deepEqual(ioc.use('Adonis/Core/MiddlewareStore'), MiddlewareStore)
		assert.deepEqual(ioc.use('Adonis/Core/HttpContext'), HttpContext)
	})
})
