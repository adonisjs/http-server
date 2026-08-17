/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { createServer } from 'node:http'
import { Logger } from '@adonisjs/logger'
import { Emitter } from '@adonisjs/events'
import { EncryptionFactory } from '@boringnode/encryption/factories'
import { Application } from '@adonisjs/application'

import { defineConfig, Server } from '../build/index.js'

const staticRoutes = Number(process.env.BENCH_STATIC_ROUTES ?? 1000)
const dynamicRoutes = Number(process.env.BENCH_DYNAMIC_ROUTES ?? 100)
const shape = process.env.BENCH_SHAPE ?? 'uniform'
const middlewareCount = Number(process.env.BENCH_MIDDLEWARE_COUNT ?? 0)

const app = new Application(new URL('./', import.meta.url), {
  environment: 'web',
  importer: () => {},
})
await app.init()

const server = new Server(
  app,
  new EncryptionFactory().create(),
  new Emitter(app),
  new Logger({ enabled: false }),
  defineConfig({
    serializeJSON(value) {
      return JSON.stringify(value)
    },
  })
)
const router = server.getRouter()
const handler = (ctx) => ctx.response.send({ hello: 'world' })
/**
 * A middleware that does nothing measures the instrumentation around it and
 * little else, which overstates what removing that instrumentation is worth.
 * `BENCH_MIDDLEWARE_KIND=realistic` swaps in one that awaits, reads a header
 * and allocates, which is still less work than session, auth or CSRF
 * middleware perform.
 */
class NoopMiddleware {
  handle(_, next) {
    return next()
  }
}

class RealisticMiddleware {
  async handle(ctx, next) {
    const userAgent = ctx.request.request.headers['user-agent'] || ''
    const meta = { length: userAgent.length, secure: ctx.request.request.socket.encrypted === true }
    if (meta.length < 0) {
      throw new Error('unreachable')
    }
    return next()
  }
}

const MiddlewareClass =
  process.env.BENCH_MIDDLEWARE_KIND === 'realistic' ? RealisticMiddleware : NoopMiddleware
const loadMiddleware = async () => ({ default: MiddlewareClass })

server.use(Array.from({ length: middlewareCount }, () => loadMiddleware))

/**
 * The `uniform` shape declares every static route before any dynamic one and
 * has no catch-all. The `app` shape mirrors how routes accumulate in a real
 * application: a dynamic route appears early among the static ones, and a top
 * level param route plus a catch-all close the file. Both shapes resolve the
 * benchmark URLs to the same routes, because the trailing routes only capture
 * URLs nothing else matches.
 */
if (shape === 'app') {
  for (let index = 0; index < 5; index++) {
    router.get(`/static/${index}`, handler)
  }
  router.get('/dynamic/early/:id', handler)
  for (let index = 5; index < staticRoutes; index++) {
    router.get(`/static/${index}`, handler)
  }
  for (let index = 0; index < dynamicRoutes; index++) {
    router.get(`/dynamic/${index}/:id`, handler)
  }
  router.get('/:section', handler)
  router.get('/:section/*', handler)
} else {
  for (let index = 0; index < staticRoutes; index++) {
    router.get(`/static/${index}`, handler)
  }
  for (let index = 0; index < dynamicRoutes; index++) {
    router.get(`/dynamic/${index}/:id`, handler)
  }
}

await server.boot()

createServer(server.handle.bind(server)).listen(4001, () => {
  process.send?.('ready')
})
