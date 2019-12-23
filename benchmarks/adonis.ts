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
import { Encryption } from '@adonisjs/encryption/build/standalone'

import { Server } from '../standalone'

const logger = new Logger({ enabled: false, level: 'trace', name: 'adonis' })
const profiler = new Profiler({ enabled: false })
const encryption = new Encryption('averylongrandom32charslongsecret')

const server = new Server(new Ioc(), logger, profiler, encryption, {
  etag: false,
  jsonpCallbackName: 'callback',
  cookie: {},
  subdomainOffset: 2,
  generateRequestId: false,
  secret: Math.random().toFixed(36).substring(2, 38),
  trustProxy: proxyaddr.compile('loopback'),
  allowMethodSpoofing: false,
})

server.router.get('/', async () => {
  return { hello: 'world' }
})
server.optimize()

createServer(server.handle.bind(server)).listen(4000, () => {
  console.log('listening on 4000')
})
