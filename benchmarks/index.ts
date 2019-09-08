import { createServer } from 'http'
import proxyaddr from 'proxy-addr'
import { Ioc } from '@adonisjs/fold'
import { Logger } from '@adonisjs/logger/build/standalone'
import { Profiler } from '@adonisjs/profiler/build/standalone'
import { Server } from '../standalone'

const logger = new Logger({ enabled: false, level: 'trace', name: 'adonis' })
const server = new Server(new Ioc(), logger, new Profiler({ enabled: false }), {
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
  return { 'hello': 'world' }
})

server.optimize()

createServer(server.handle.bind(server)).listen('3333')
