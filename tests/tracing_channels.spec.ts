/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import supertest from 'supertest'
import { test } from '@japa/runner'
import type { NextFn } from '@poppinss/middleware/types'
import { AppFactory } from '@adonisjs/application/factories'
import { createServer } from 'node:http'

import type { HttpContext } from '../src/http_context/main.ts'
import { ServerFactory } from '../factories/server_factory.ts'
import {
  httpRequest,
  httpMiddleware,
  httpRouteHandler,
  httpExceptionHandler,
  httpResponseSerializer,
} from '../src/tracing_channels.ts'

const BASE_URL = new URL('./app/', import.meta.url)

test('emit tracing events when channels have subscribers', async ({ assert }) => {
  const events: string[] = []
  const createHandlers = (name: string) => ({
    start() {
      events.push(name)
    },
    end() {},
    asyncStart() {},
    asyncEnd() {},
    error() {},
  })
  const requestHandlers = createHandlers('request')
  const middlewareHandlers = createHandlers('middleware')
  const routeHandlers = createHandlers('route')
  const exceptionHandlers = createHandlers('exception')
  const responseHandlers = createHandlers('response')

  httpRequest.subscribe(requestHandlers)
  httpMiddleware.subscribe(middlewareHandlers)
  httpRouteHandler.subscribe(routeHandlers)
  httpExceptionHandler.subscribe(exceptionHandlers)
  httpResponseSerializer.subscribe(responseHandlers)

  try {
    const app = new AppFactory().create(BASE_URL, () => {})
    const server = new ServerFactory().merge({ app }).create()
    const httpServer = createServer(server.handle.bind(server))

    await app.init()
    server.use([
      async () => ({
        default: class GlobalMiddleware {
          handle(_: HttpContext, next: NextFn) {
            return next()
          }
        },
      }),
    ])
    server
      .getRouter()
      .get('/', () => ({ hello: 'world' }))
      .middleware((_, next) => next())
    await server.boot()

    await supertest(httpServer).get('/').expect(200).expect({ hello: 'world' })
    await supertest(httpServer).get('/missing').expect(404)

    assert.deepEqual(events, [
      'request',
      'middleware',
      'middleware',
      'route',
      'response',
      'request',
      'middleware',
      'exception',
      'response',
    ])
  } finally {
    httpRequest.unsubscribe(requestHandlers)
    httpMiddleware.unsubscribe(middlewareHandlers)
    httpRouteHandler.unsubscribe(routeHandlers)
    httpExceptionHandler.unsubscribe(exceptionHandlers)
    httpResponseSerializer.unsubscribe(responseHandlers)
  }
})
