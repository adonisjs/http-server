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
import { createServer } from 'node:http'
import type { NextFn } from '@poppinss/middleware/types'

import { Router } from '../src/router/main.js'
import { AppFactory } from '../test_factories/app.js'
import { HttpContext } from '../src/http_context/main.js'
import { ServerFactory } from '../test_factories/server_factory.js'

test.group('Server', () => {
  test('fail when booting without defining middleware', ({ assert }) => {
    const app = new AppFactory().create()
    const server = new ServerFactory().merge({ app }).create()

    assert.rejects(
      () => server.boot(),
      'Cannot boot HTTP server. Register middleware using "server.use" first'
    )
  })

  test('get router instance used by the server', ({ assert }) => {
    const app = new AppFactory().create()
    const server = new ServerFactory().merge({ app }).create()
    server.use([], [], {})

    assert.instanceOf(server.getRouter(), Router)
  })

  test('store http server instance', ({ assert }) => {
    const app = new AppFactory().create()
    const server = new ServerFactory().merge({ app }).create()
    server.use([], [], {})

    const httpServer = createServer(() => {})
    server.setNodeServer(httpServer)

    assert.strictEqual(server.getNodeServer(), httpServer)
  })

  test('close node server ', async ({ assert }) => {
    assert.plan(1)

    const app = new AppFactory().create()
    const server = new ServerFactory().merge({ app }).create()
    server.use([], [], {})

    const httpServer = createServer(() => {}).listen(3000)
    server.setNodeServer(httpServer)

    httpServer.on('close', () => {
      assert.isFalse(httpServer.listening)
    })

    await server.close()
  })

  test('noop when http server is not listening or not set', async ({ assert }) => {
    const app = new AppFactory().create()
    const server = new ServerFactory().merge({ app }).create()
    server.use([], [], {})

    assert.doesNotRejects(() => server.close())

    const httpServer = createServer(() => {})
    server.setNodeServer(httpServer)

    assert.doesNotRejects(() => server.close())
  })
})

test.group('Server | Response handling', () => {
  test('invoke router handler', async ({ assert }) => {
    const app = new AppFactory().create()
    const server = new ServerFactory().merge({ app }).create()
    const httpServer = createServer(server.handle.bind(server))

    await app.init()

    server.use([], [], {})
    server.getRouter()!.get('/', async ({ response }) => response.send('handled'))
    await server.boot()

    const { text } = await supertest(httpServer).get('/').expect(200)
    assert.equal(text, 'handled')
  })

  test('use route handler return value when response.send is not called', async ({ assert }) => {
    const app = new AppFactory().create()
    const server = new ServerFactory().merge({ app }).create()
    const httpServer = createServer(server.handle.bind(server))

    await app.init()

    server.use([], [], {})
    server.getRouter()!.get('/', async () => 'handled')
    await server.boot()

    const { text } = await supertest(httpServer).get('/').expect(200)
    assert.equal(text, 'handled')
  })

  test('do not use return value when response.send is called', async ({ assert }) => {
    const app = new AppFactory().create()
    const server = new ServerFactory().merge({ app }).create()
    const httpServer = createServer(server.handle.bind(server))

    await app.init()

    server.use([], [], {})
    server.getRouter()!.get('/', async ({ response }) => {
      response.send('handled')
      return 'done'
    })
    await server.boot()

    const { text } = await supertest(httpServer).get('/').expect(200)
    assert.equal(text, 'handled')
  })

  test('redirect to given route', async ({ assert }) => {
    assert.plan(2)

    const app = new AppFactory().create()
    const server = new ServerFactory().merge({ app }).create()
    const httpServer = createServer(server.handle.bind(server))

    await app.init()

    server.use([], [], {})
    server
      .getRouter()!
      .get('/guides/:doc', async ({ params }) => {
        assert.deepEqual(params, { doc: 'introduction' })
      })
      .as('guides')

    server.getRouter()!.on('/docs/:doc').redirect('guides')
    await server.boot()

    const { redirects } = await supertest(httpServer).get('/docs/introduction').redirects(1)

    assert.deepEqual(
      redirects.map((url) => new URL(url).pathname),
      ['/guides/introduction']
    )
  })

  test('redirect to given path', async ({ assert }) => {
    assert.plan(2)

    const app = new AppFactory().create()
    const server = new ServerFactory().merge({ app }).create()
    const httpServer = createServer(server.handle.bind(server))

    await app.init()

    server.use([], [], {})
    server
      .getRouter()!
      .get('/guides/:doc', async ({ params }) => {
        assert.deepEqual(params, { doc: 'introduction' })
      })
      .as('guides')

    server.getRouter()!.on('/docs/:doc').redirectToPath('/guides/introduction')
    await server.boot()

    const { redirects } = await supertest(httpServer).get('/docs/introduction').redirects(1)
    assert.deepEqual(
      redirects.map((url) => new URL(url).pathname),
      ['/guides/introduction']
    )
  })

  test('invoke a domain specific router handler', async ({ assert }) => {
    const app = new AppFactory().create()
    const server = new ServerFactory().merge({ app }).create()
    const httpServer = createServer(server.handle.bind(server))

    await app.init()

    server.use([], [], {})

    server
      .getRouter()!
      .get('/', async ({ response }) => response.send('handled'))
      .domain(':tenant.adonisjs.com')

    await server.boot()

    const { text } = await supertest(httpServer)
      .get('/')
      .set('X-Forwarded-Host', 'blog.adonisjs.com')
      .expect(200)

    assert.equal(text, 'handled')
  })

  test('return 404 when route for a top level domain does not exists', async ({ assert }) => {
    const app = new AppFactory().create()
    const server = new ServerFactory().merge({ app }).create()
    const httpServer = createServer(server.handle.bind(server))

    await app.init()

    server.use([], [], {})

    server
      .getRouter()!
      .get('/', async ({ response }) => response.send('handled'))
      .domain(':tenant.adonisjs.com')

    await server.boot()

    const { text } = await supertest(httpServer).get('/').expect(404)
    assert.equal(text, 'Cannot GET:/')
  })
})

test.group('Server | middleware', () => {
  test('execute server middleware before route handler', async ({ assert }) => {
    const stack: string[] = []

    const app = new AppFactory().create()
    const server = new ServerFactory().merge({ app }).create()
    const httpServer = createServer(server.handle.bind(server))

    await app.init()

    class LogMiddleware {
      handle(_: HttpContext, next: NextFn) {
        stack.push('fn1')
        return next()
      }
    }

    class LogMiddleware2 {
      handle(_: HttpContext, next: NextFn) {
        stack.push('fn2')
        return next()
      }
    }

    server.use(
      [
        async () => {
          return {
            default: LogMiddleware,
          }
        },
        async () => {
          return {
            default: LogMiddleware2,
          }
        },
      ],
      [],
      {}
    )

    server.getRouter()!.get('/', async () => {
      stack.push('handler')
      return 'done'
    })

    await server.boot()

    await supertest(httpServer).get('/').expect(200)
    assert.deepEqual(stack, ['fn1', 'fn2', 'handler'])
  })

  test('execute server middleware before route middleware and handler', async ({ assert }) => {
    const stack: string[] = []

    const app = new AppFactory().create()
    const server = new ServerFactory().merge({ app }).create()
    const httpServer = createServer(server.handle.bind(server))
    await app.init()

    class LogMiddleware {
      handle(_: HttpContext, next: NextFn) {
        stack.push('fn1')
        return next()
      }
    }

    class LogMiddleware2 {
      handle(_: HttpContext, next: NextFn) {
        stack.push('fn2')
        return next()
      }
    }

    server.use(
      [
        async () => {
          return {
            default: LogMiddleware,
          }
        },
        async () => {
          return {
            default: LogMiddleware2,
          }
        },
      ],
      [],
      {}
    )

    server
      .getRouter()!
      .get('/', async () => {
        stack.push('handler')
        return 'done'
      })
      .middleware(async function routeMiddleware(_ctx: HttpContext, next: NextFn) {
        stack.push('route fn1')
        await next()
      })

    await server.boot()

    await supertest(httpServer).get('/').expect(200)
    assert.deepEqual(stack, ['fn1', 'fn2', 'route fn1', 'handler'])
  })

  test('terminate request from server middleware', async ({ assert }) => {
    const stack: string[] = []

    const app = new AppFactory().create()
    const server = new ServerFactory().merge({ app }).create()
    const httpServer = createServer(server.handle.bind(server))
    await app.init()

    class LogMiddleware {
      handle(ctx: HttpContext, _: NextFn) {
        stack.push('fn1')
        ctx.response.send('completed')
      }
    }

    class LogMiddleware2 {
      handle(_: HttpContext, next: NextFn) {
        stack.push('fn2')
        return next()
      }
    }

    server.use(
      [
        async () => {
          return {
            default: LogMiddleware,
          }
        },
        async () => {
          return {
            default: LogMiddleware2,
          }
        },
      ],
      [],
      {}
    )

    server
      .getRouter()!
      .get('/', async () => {
        stack.push('handler')
        return 'done'
      })
      .middleware(async function routeMiddleware(_: HttpContext, next: NextFn) {
        stack.push('route fn1')
        await next()
      })

    await server.boot()

    const { text } = await supertest(httpServer).get('/').expect(200)
    assert.deepEqual(stack, ['fn1'])
    assert.equal(text, 'completed')
  })

  test('terminate request from server middleware by returning value', async ({ assert }) => {
    const stack: string[] = []

    const app = new AppFactory().create()
    const server = new ServerFactory().merge({ app }).create()
    const httpServer = createServer(server.handle.bind(server))
    await app.init()

    class LogMiddleware {
      handle(__: HttpContext, _: NextFn) {
        stack.push('fn1')
        return 'completed'
      }
    }

    class LogMiddleware2 {
      handle(_: HttpContext, next: NextFn) {
        stack.push('fn2')
        return next()
      }
    }

    server.use(
      [
        async () => {
          return {
            default: LogMiddleware,
          }
        },
        async () => {
          return {
            default: LogMiddleware2,
          }
        },
      ],
      [],
      {}
    )

    server
      .getRouter()!
      .get('/', async () => {
        stack.push('handler')
        return 'done'
      })
      .middleware(async function routeMiddleware(_: HttpContext, next: NextFn) {
        stack.push('route fn1')
        await next()
      })

    await server.boot()

    const { text } = await supertest(httpServer).get('/').expect(200)
    assert.deepEqual(stack, ['fn1'])
    assert.equal(text, 'completed')
  })

  test('terminate request from server by raising exception', async ({ assert }) => {
    const stack: string[] = []

    const app = new AppFactory().create()
    const server = new ServerFactory().merge({ app }).create()
    const httpServer = createServer(server.handle.bind(server))
    await app.init()

    class LogMiddleware {
      handle(__: HttpContext, _: NextFn) {
        stack.push('fn1')
        throw new Error('Something went wrong')
      }
    }

    class LogMiddleware2 {
      handle(_: HttpContext, next: NextFn) {
        stack.push('fn2')
        return next()
      }
    }

    server.use(
      [
        async () => {
          return {
            default: LogMiddleware,
          }
        },
        async () => {
          return {
            default: LogMiddleware2,
          }
        },
      ],
      [],
      {}
    )

    server
      .getRouter()!
      .get('/', async () => {
        stack.push('handler')
        return 'done'
      })
      .middleware(async function routeMiddleware(_: HttpContext, next: NextFn) {
        stack.push('route fn1')
        await next()
      })

    await server.boot()

    const { text } = await supertest(httpServer).get('/').expect(500)
    assert.deepEqual(stack, ['fn1'])
    assert.equal(text, 'Something went wrong')
  })
})

test.group('Server | error handler', () => {
  test('pass server middleware errors to the error handler', async ({ assert }) => {
    const app = new AppFactory().create()
    const server = new ServerFactory().merge({ app }).create()
    const httpServer = createServer(server.handle.bind(server))
    await app.init()

    class ErrorHandler {
      handle(error: any, { response }: HttpContext) {
        assert.equal(error.message, 'Something went wrong')
        response.status(200).send('handled by error handler')
      }
    }

    class LogMiddleware {
      handle() {
        throw new Error('Something went wrong')
      }
    }

    server.use(
      [
        async () => {
          return {
            default: LogMiddleware,
          }
        },
      ],
      [],
      {}
    )

    server.errorHandler(async () => {
      return {
        default: ErrorHandler,
      }
    })

    await server.boot()

    const { text } = await supertest(httpServer).get('/').expect(200)
    assert.equal(text, 'handled by error handler')
  })

  test('pass router middleware errors to the error handler', async ({ assert }) => {
    const app = new AppFactory().create()
    const server = new ServerFactory().merge({ app }).create()
    const httpServer = createServer(server.handle.bind(server))
    await app.init()

    class ErrorHandler {
      handle(error: any, { response }: HttpContext) {
        assert.equal(error.message, 'Something went wrong')
        response.status(200).send('handled by error handler')
      }
    }

    class LogMiddleware {
      handle() {
        throw new Error('Something went wrong')
      }
    }

    server.use(
      [],
      [
        async () => {
          return {
            default: LogMiddleware,
          }
        },
      ],
      {}
    )

    server.errorHandler(async () => {
      return {
        default: ErrorHandler,
      }
    })

    server.getRouter()!.get('/', () => {})
    await server.boot()

    const { text } = await supertest(httpServer).get('/').expect(200)
    assert.equal(text, 'handled by error handler')
  })

  test('pass named middleware errors to the error handler', async ({ assert }) => {
    class LogMiddleware {
      handle() {
        throw new Error('Something went wrong')
      }
    }

    const namedMiddleware = {
      auth: async () => {
        return {
          default: LogMiddleware,
        }
      },
    }

    const app = new AppFactory().create()
    const server = new ServerFactory<typeof namedMiddleware>().merge({ app }).create()
    const httpServer = createServer(server.handle.bind(server))
    await app.init()

    class ErrorHandler {
      handle(error: any, { response }: HttpContext) {
        assert.equal(error.message, 'Something went wrong')
        response.status(200).send('handled by error handler')
      }
    }

    server.use([], [], namedMiddleware)

    server.errorHandler(async () => {
      return {
        default: ErrorHandler,
      }
    })

    server
      .getRouter()!
      .get('/', () => {})
      .middleware('auth')
    await server.boot()

    const { text } = await supertest(httpServer).get('/').expect(200)
    assert.equal(text, 'handled by error handler')
  })

  test('pass route handler errors to the error handler', async ({ assert }) => {
    const app = new AppFactory().create()
    const server = new ServerFactory().merge({ app }).create()
    const httpServer = createServer(server.handle.bind(server))
    await app.init()

    class ErrorHandler {
      handle(error: any, { response }: HttpContext) {
        assert.equal(error.message, 'Something went wrong')
        response.status(200).send('handled by error handler')
      }
    }

    server.use([], [], {})

    server.errorHandler(async () => {
      return {
        default: ErrorHandler,
      }
    })

    server.getRouter()!.get('/', () => {
      throw new Error('Something went wrong')
    })
    await server.boot()

    const { text } = await supertest(httpServer).get('/').expect(200)
    assert.equal(text, 'handled by error handler')
  })

  test('report response serialization errors', async ({ assert }) => {
    const app = new AppFactory().create()
    const server = new ServerFactory().merge({ app }).create()
    const httpServer = createServer(server.handle.bind(server))
    await app.init()

    server.use([], [], {})
    server.getRouter()!.get('/', async () => {
      return {
        toJSON() {
          throw new Error('blowup')
        },
      }
    })

    await server.boot()

    const { text } = await supertest(httpServer).get('/').expect(500)
    assert.equal(text, 'blowup')
  })

  test('raise 404 when route is missing', async ({ assert }) => {
    const app = new AppFactory().create()
    const server = new ServerFactory().merge({ app }).create()
    const httpServer = createServer(server.handle.bind(server))
    await app.init()

    server.use([], [], {})
    await server.boot()

    const { text } = await supertest(httpServer).get('/').expect(404)
    assert.equal(text, 'Cannot GET:/')
  })
})

test.group('Server | force content negotiation', () => {
  test('set accept header when forceContentNegotiationTo is a string', async ({ assert }) => {
    const app = new AppFactory().create()
    const server = new ServerFactory().merge({ app }).create()
    const httpServer = createServer(server.handle.bind(server))
    await app.init()

    server.use([], [], {})
    await server.boot()

    server.getRouter()!.get('/', async ({ request, response }) => {
      response.send(request.header('accept'))
    })
    await server.boot()

    const { text } = await supertest(httpServer).get('/').expect(200)
    assert.equal(text, 'application/json')
  }).fails('Ship a middleware for this')

  test('find if the signed url signature is valid', async ({ assert }) => {
    const app = new AppFactory().create()
    const server = new ServerFactory().merge({ app }).create()
    const httpServer = createServer(server.handle.bind(server))
    await app.init()

    server.use([], [], {})

    server
      .getRouter()!
      .get('/users/:id', async ({ request }) => {
        return {
          hasValidSignature: request.hasValidSignature(),
        }
      })
      .as('showUser')

    await server.boot()

    /**
     * Make a signed url
     */
    const url = server.getRouter()!.makeSignedUrl('showUser', [1], {
      qs: { site: 1, db: 'pg', dbUser: 1 },
    })

    const { body } = await supertest(httpServer).get(url).expect(200)
    assert.deepEqual(body, { hasValidSignature: true })
  }).tags(['regression'])

  test('access context from the async local storage', async ({ assert }) => {
    const app = new AppFactory().create()
    const server = new ServerFactory()
      .merge({
        app,
        config: {
          useAsyncLocalStorage: true,
        },
      })
      .create()

    const httpServer = createServer(server.handle.bind(server))
    await app.init()

    server.use([], [], {})

    server.getRouter()!.get('/', async (ctx) => {
      return {
        enabled: HttpContext.usingAsyncLocalStorage,
        get: HttpContext.get() === ctx,
        getOrFail: HttpContext.getOrFail() === ctx,
      }
    })

    await server.boot()

    assert.strictEqual(HttpContext.usingAsyncLocalStorage, true)
    assert.strictEqual(HttpContext.get(), null)
    assert.throws(
      () => HttpContext.getOrFail(),
      'Http context is not available outside of an HTTP request'
    )

    const { body } = await supertest(httpServer).get('/').expect(200)
    assert.deepEqual(body, {
      enabled: true,
      get: true,
      getOrFail: true,
    })
  })

  test('run a callback outside the ALS context', async ({ assert }) => {
    const app = new AppFactory().create()
    const server = new ServerFactory()
      .merge({
        app,
        config: {
          useAsyncLocalStorage: true,
        },
      })
      .create()

    const httpServer = createServer(server.handle.bind(server))
    await app.init()

    server.use([], [], {})

    server.getRouter()!.get('/', async (ctx) => {
      return HttpContext.runOutsideContext(() => {
        return {
          enabled: HttpContext.usingAsyncLocalStorage,
          get: HttpContext.get() === ctx,
        }
      })
    })

    await server.boot()

    const { body } = await supertest(httpServer).get('/').expect(200)
    assert.deepEqual(body, {
      enabled: true,
      get: false,
    })
  })

  test('disallow async local storage access when not enabled', async ({ assert }) => {
    const app = new AppFactory().create()
    const server = new ServerFactory()
      .merge({
        app,
        config: {
          useAsyncLocalStorage: false,
        },
      })
      .create()

    const httpServer = createServer(server.handle.bind(server))
    await app.init()

    server.use([], [], {})

    server.getRouter()!.get('/', async () => {
      return {
        enabled: HttpContext.usingAsyncLocalStorage,
        get: HttpContext.get() === null,
      }
    })

    server.getRouter()!.get('/fail', async () => {
      return HttpContext.getOrFail()
    })

    await server.boot()

    assert.strictEqual(HttpContext.usingAsyncLocalStorage, false)
    assert.strictEqual(HttpContext.get(), null)
    assert.throws(
      () => HttpContext.getOrFail(),
      'HTTP context is not available. Enable "useAsyncLocalStorage" inside "config/app.ts" file'
    )

    const { body } = await supertest(httpServer).get('/').expect(200)
    assert.deepEqual(body, {
      enabled: false,
      get: true,
    })

    const { text } = await supertest(httpServer).get('/fail').expect(500)
    assert.strictEqual(
      text,
      'HTTP context is not available. Enable "useAsyncLocalStorage" inside "config/app.ts" file'
    )
  })

  test('run a callback outside the ALS context', async ({ assert }) => {
    const app = new AppFactory().create()
    const server = new ServerFactory()
      .merge({
        app,
        config: {
          useAsyncLocalStorage: false,
        },
      })
      .create()

    const httpServer = createServer(server.handle.bind(server))
    await app.init()

    server.use([], [], {})

    server.getRouter()!.get('/', async (ctx) => {
      return HttpContext.runOutsideContext(() => {
        return {
          enabled: HttpContext.usingAsyncLocalStorage,
          get: HttpContext.get() === ctx,
        }
      })
    })

    await server.boot()

    const { body } = await supertest(httpServer).get('/').expect(200)
    assert.deepEqual(body, {
      enabled: false,
      get: false,
    })
  })
})
