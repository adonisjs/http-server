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
import { asyncLocalStorage } from '../../src/http_context/local_storage.ts'
import { ServerFactory } from '../../factories/server_factory.ts'
import { waitUntil } from '../../src/wait_until.ts'

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
        setTimeout(150).then(() => {
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

  test('handle promise resolves only after the scheduled work has settled with async local storage enabled', async ({
    assert,
  }) => {
    const app = new AppFactory().create(BASE_URL, () => {})
    const server = new ServerFactory()
      .merge({
        app,
        config: {
          useAsyncLocalStorage: true,
        },
      })
      .create()

    let handlePromise: Promise<void> | undefined
    const httpServer = createServer((req, res) => {
      handlePromise = server.handle(req, res)
    })
    await app.init()

    let settled = false
    server.use([])
    server.getRouter().get('/', (ctx) => {
      ctx.waitUntil(
        setTimeout(150).then(() => {
          settled = true
        })
      )
      return 'handled'
    })
    await server.boot()

    try {
      await supertest(httpServer).get('/').expect(200)
      assert.isFalse(settled)

      await handlePromise
      assert.isTrue(settled)
    } finally {
      asyncLocalStorage.destroy()
    }
  })

  test('draining callbacks re-enter the async local storage and can schedule more work', async ({
    assert,
  }) => {
    assert.plan(3)

    const app = new AppFactory().create(BASE_URL, () => {})
    const server = new ServerFactory()
      .merge({
        app,
        config: {
          useAsyncLocalStorage: true,
        },
      })
      .create()

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
          assert.strictEqual(HttpContext.get(), ctx)

          ctx.waitUntil(setTimeout(10).then(() => events.push('wave-2')))
        })
      )
      events.push('handler')
      return 'handled'
    })
    await server.boot()

    try {
      await supertest(httpServer).get('/').expect(200)
      assert.deepEqual(events, ['handler'])

      await handlePromise
      assert.deepEqual(events, ['handler', 'wave-1', 'wave-2'])
    } finally {
      asyncLocalStorage.destroy()
    }
  })

  test('handle promise rejects when the request pipeline rejects and still waits for the gate', async ({
    assert,
  }) => {
    const app = new AppFactory().create(BASE_URL, () => {})
    const logs: any[] = []
    const logger: any = {
      child: () => logger,
      fatal: () => {
        throw new Error('request logger exploded')
      },
      error: (message: any) => logs.push(message),
    }
    const server = new ServerFactory().merge({ app, logger }).create()

    let handlePromise: Promise<void> | undefined
    const httpServer = createServer((req, res) => {
      handlePromise = server.handle(req, res)
    })
    await app.init()

    const events: string[] = []
    server.use([])
    server.errorHandler(async () => {
      return {
        default: class {
          report() {}
          handle() {
            throw new Error('error handler failed')
          }
        },
      }
    })
    server.getRouter().get('/', (ctx) => {
      ctx.waitUntil(
        setTimeout(10).then(() => {
          events.push('wave-1')
          ctx.waitUntil(setTimeout(200).then(() => events.push('wave-2')))
        })
      )
      throw new Error('route failed')
    })
    await server.boot()

    /**
     * The route error reaches the custom error handler, whose failure makes
     * the middleware runner reject. Server.handle() then attempts to log
     * the rejection via "ctx.logger.fatal", which explodes as well. That
     * final failure rejects the pipeline
     */
    await supertest(httpServer).get('/')

    let rejection: Error | undefined
    try {
      await handlePromise
    } catch (error: any) {
      rejection = error
    }

    assert.instanceOf(rejection, Error)
    assert.equal(rejection!.message, 'request logger exploded')

    /**
     * The rejection must not swallow the gate. Without it, the handle
     * promise would reject long before the 10ms and 200ms timers resolve
     */
    assert.deepEqual(events, ['wave-1', 'wave-2'])
  })

  test('waits for work scheduled after an await in the handler', async ({ assert }) => {
    const app = new AppFactory().create(BASE_URL, () => {})
    const server = new ServerFactory().merge({ app }).create()

    let handlePromise: Promise<void> | undefined
    const httpServer = createServer((req, res) => {
      handlePromise = server.handle(req, res)
    })
    await app.init()

    /**
     * The handler awaits before scheduling the work, so the gate does not
     * exist at the time "server.handle()" starts the pipeline. The returned
     * promise must still wait for the scheduled work
     */
    let settled = false
    server.use([])
    server.getRouter().get('/', async (ctx) => {
      await setTimeout(20)
      ctx.waitUntil(
        setTimeout(150).then(() => {
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

  test('schedule work from the global waitUntil when ALS is enabled', async ({ assert }) => {
    const app = new AppFactory().create(BASE_URL, () => {})
    const server = new ServerFactory()
      .merge({
        app,
        config: { useAsyncLocalStorage: true },
      })
      .create()

    let handlePromise: Promise<void> | undefined
    const httpServer = createServer((req, res) => {
      handlePromise = server.handle(req, res)
    })
    await app.init()

    let ranInSameContext = false
    server.use([])
    server.getRouter().get('/', (ctx) => {
      waitUntil(
        setTimeout(10).then(() => {
          ranInSameContext = HttpContext.get() === ctx
        })
      )
      return 'handled'
    })
    await server.boot()

    try {
      await supertest(httpServer).get('/').expect(200)
      await handlePromise
      assert.isTrue(ranInSameContext)
    } finally {
      asyncLocalStorage.destroy()
    }
  })

  test('global waitUntil throws when ALS is disabled', async ({ assert }) => {
    const app = new AppFactory().create(BASE_URL, () => {})
    const server = new ServerFactory()
      .merge({
        app,
        config: { useAsyncLocalStorage: false },
      })
      .create()
    const httpServer = createServer(server.handle.bind(server))
    await app.init()

    server.use([])
    server.getRouter().get('/', () => {
      try {
        waitUntil(Promise.resolve())
        return 'scheduled'
      } catch (error) {
        return { error: (error as Error).message }
      }
    })
    await server.boot()

    const { body } = await supertest(httpServer).get('/').expect(200)
    assert.equal(
      body.error,
      'HTTP context is not available. Enable "useAsyncLocalStorage" inside "config/app.ts" file'
    )
  })
})
