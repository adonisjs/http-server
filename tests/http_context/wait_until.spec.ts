/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import 'reflect-metadata'
import supertest from 'supertest'
import { test } from '@japa/runner'
import { setTimeout } from 'node:timers/promises'
import { createServer } from 'node:http'
import { AppFactory } from '@adonisjs/application/factories'

import { HttpContext } from '../../src/http_context/main.ts'
import { ServerFactory } from '../../factories/server_factory.ts'

const BASE_URL = new URL('./app/', import.meta.url)

test.group('Http context | waitUntil', () => {
  test('run waitUntil callbacks after the response has been sent', async ({ assert }) => {
    const app = new AppFactory().create(BASE_URL, () => {})
    const server = new ServerFactory().merge({ app }).create()
    const httpServer = createServer(server.handle.bind(server))
    await app.init()

    const events: string[] = []
    server.use([])
    server.getRouter().get('/', (ctx) => {
      ctx.waitUntil(
        setTimeout(50).then(() => {
          events.push('wait-until')
        })
      )
      events.push('handler')
      return 'handled'
    })
    await server.boot()

    const { text } = await supertest(httpServer).get('/').expect(200)
    assert.equal(text, 'handled')
    assert.deepEqual(events, ['handler'])

    await setTimeout(100)
    assert.deepEqual(events, ['handler', 'wait-until'])
  })

  test('settle multiple promises in parallel and log rejections', async ({ assert }) => {
    const app = new AppFactory().create(BASE_URL, () => {})
    const logs: any[] = []
    const logger: any = {
      child: () => logger,
      error: (message: any) => logs.push(message),
    }
    const server = new ServerFactory().merge({ app, logger }).create()
    const httpServer = createServer(server.handle.bind(server))
    await app.init()

    let secondRan = false
    server.use([])
    server.getRouter().get('/', (ctx) => {
      ctx.waitUntil(Promise.reject(new Error('e1')))
      ctx.waitUntil(
        setTimeout(10).then(() => {
          secondRan = true
        })
      )
      return 'handled'
    })
    await server.boot()

    await supertest(httpServer).get('/').expect(200)
    await setTimeout(100)

    assert.isTrue(secondRan)
    assert.equal(logs.length, 1)
    assert.equal(logs[0].err.message, 'e1')
  })

  test('never raise an unhandled rejection for promises rejecting before the response is flushed', async ({
    assert,
  }) => {
    const app = new AppFactory().create(BASE_URL, () => {})
    const logs: any[] = []
    const logger: any = {
      child: () => logger,
      error: (message: any) => logs.push(message),
    }
    const server = new ServerFactory().merge({ app, logger }).create()
    const httpServer = createServer(server.handle.bind(server))
    await app.init()

    server.use([])
    server.getRouter().get('/', async (ctx) => {
      ctx.waitUntil(Promise.reject(new Error('early')))
      await setTimeout(0)
      return 'handled'
    })
    await server.boot()

    await supertest(httpServer).get('/').expect(200)
    await setTimeout(100)

    assert.equal(logs.length, 1)
    assert.equal(logs[0].err.message, 'early')
  })

  test('disallow scheduling after the request lifecycle has completed', async ({ assert }) => {
    const app = new AppFactory().create(BASE_URL, () => {})
    const server = new ServerFactory().merge({ app }).create()
    const httpServer = createServer(server.handle.bind(server))
    await app.init()

    let ctxRef: HttpContext | undefined
    server.use([])
    server.getRouter().get('/', (ctx) => {
      ctxRef = ctx
      ctx.waitUntil(Promise.resolve())
      return 'handled'
    })
    await server.boot()

    await supertest(httpServer).get('/').expect(200)
    await setTimeout(50)

    assert.instanceOf(ctxRef, HttpContext)
    assert.throws(
      () => ctxRef!.waitUntil(Promise.resolve()),
      'Cannot schedule work using "waitUntil()" after the request lifecycle has completed'
    )
  })

  test('handle promise resolves only after the scheduled work has settled', async ({ assert }) => {
    const app = new AppFactory().create(BASE_URL, () => {})
    const server = new ServerFactory().merge({ app }).create()

    let handlePromise: Promise<void> | undefined
    const httpServer = createServer((req, res) => {
      handlePromise = server.handle(req, res)
    })
    await app.init()

    let settled = false
    server.use([])
    server.getRouter().get('/', (ctx) => {
      ctx.waitUntil(
        setTimeout(30).then(() => {
          settled = true
        })
      )
      return 'handled'
    })
    await server.boot()

    await supertest(httpServer).get('/').expect(200)
    assert.isFalse(settled)

    await handlePromise
    assert.isTrue(settled)
  })

  test('promises scheduled from a running promise join the next drain wave', async ({ assert }) => {
    const app = new AppFactory().create(BASE_URL, () => {})
    const server = new ServerFactory().merge({ app }).create()

    let handlePromise: Promise<void> | undefined
    const httpServer = createServer((req, res) => {
      handlePromise = server.handle(req, res)
    })
    await app.init()

    const events: string[] = []
    server.use([])
    server.getRouter().get('/', (ctx) => {
      ctx.waitUntil(
        setTimeout(10).then(() => {
          events.push('wave-1')
          ctx.waitUntil(setTimeout(10).then(() => events.push('wave-2')))
        })
      )
      events.push('handler')
      return 'handled'
    })
    await server.boot()

    await supertest(httpServer).get('/').expect(200)
    assert.deepEqual(events, ['handler'])

    await handlePromise
    assert.deepEqual(events, ['handler', 'wave-1', 'wave-2'])
  })
})
