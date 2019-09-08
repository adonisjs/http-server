/*
 * @adonisjs/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import { createServer } from 'http'
import proxyaddr from 'proxy-addr'
import { Ioc } from '@adonisjs/fold'
import { Logger } from '@adonisjs/logger/build/standalone'
import { Profiler } from '@adonisjs/profiler/build/standalone'
import { Server } from '../standalone'

const ioc = new Ioc()
class HomeController {
  public handle () {
    return { hello: 'world' }
  }
}

ioc.singleton('App/Controllers/Http/HomeController', () => {
  return new HomeController()
})

const logger = new Logger({ enabled: false, level: 'trace', name: 'adonis' })
const server = new Server(ioc, logger, new Profiler({ enabled: false }), {
  etag: false,
  jsonpCallbackName: 'callback',
  cookie: {},
  subdomainOffset: 2,
  generateRequestId: false,
  secret: Math.random().toFixed(36).substring(2, 38),
  trustProxy: proxyaddr.compile('loopback'),
  allowMethodSpoofing: false,
})

server.router.get('/', 'HomeController')

server.optimize()

createServer(server.handle.bind(server)).listen('3333')
