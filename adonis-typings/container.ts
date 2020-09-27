/**
 * @adonisjs/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@ioc:Adonis/Core/Application' {
	import { RouterContract } from '@ioc:Adonis/Core/Route'
	import { ServerContract } from '@ioc:Adonis/Core/Server'
	import { RequestConstructorContract } from '@ioc:Adonis/Core/Request'
	import { ResponseConstructorContract } from '@ioc:Adonis/Core/Response'
	import { HttpContextConstructorContract } from '@ioc:Adonis/Core/HttpContext'

	export interface ContainerBindings {
		'Adonis/Core/Route': RouterContract
		'Adonis/Core/Server': ServerContract
		'Adonis/Core/Request': RequestConstructorContract
		'Adonis/Core/Response': ResponseConstructorContract
		'Adonis/Core/HttpContext': HttpContextConstructorContract
	}
}
