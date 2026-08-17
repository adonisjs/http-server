/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { fastify } from 'fastify'
import middie from '@fastify/middie'

const staticRoutes = Number(process.env.BENCH_STATIC_ROUTES ?? 1000)
const dynamicRoutes = Number(process.env.BENCH_DYNAMIC_ROUTES ?? 100)
const shape = process.env.BENCH_SHAPE ?? 'uniform'
const middlewareCount = Number(process.env.BENCH_MIDDLEWARE_COUNT ?? 0)
const app = fastify()
const handler = (_, reply) => reply.send({ hello: 'world' })

await app.register(middie.default)

/**
 * Mirror of the middleware registered by the AdonisJS server, so both sides run
 * comparable work. See `BENCH_MIDDLEWARE_KIND` there.
 */
const middleware =
  process.env.BENCH_MIDDLEWARE_KIND === 'realistic'
    ? async (req, _, next) => {
        const userAgent = req.headers['user-agent'] || ''
        const meta = { length: userAgent.length, secure: req.socket.encrypted === true }
        if (meta.length < 0) {
          throw new Error('unreachable')
        }
        next()
      }
    : (_, __, next) => next()

for (let index = 0; index < middlewareCount; index++) {
  app.use(middleware)
}

for (let index = 0; index < staticRoutes; index++) {
  app.get(`/static/${index}`, handler)
}
for (let index = 0; index < dynamicRoutes; index++) {
  app.get(`/dynamic/${index}/:id`, handler)
}

/**
 * Mirror of the `app` shape registered by the AdonisJS server, so both control
 * and subject serve the same route table. Fastify resolves by specificity
 * rather than registration order, so the declaration position of these routes
 * does not matter here.
 */
if (shape === 'app') {
  app.get('/dynamic/early/:id', handler)
  app.get('/:section', handler)
  app.get('/:section/*', handler)
}

await app.listen({ port: 3001 })
process.send?.('ready')
