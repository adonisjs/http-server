/**
 * @adonisjs/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../adonis-typings/index.ts" />

import test from 'japa'
import 'reflect-metadata'
import supertest from 'supertest'
import { createServer } from 'http'
import { inject } from '@adonisjs/fold'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ProfilerAction, ProfilerRow } from '@ioc:Adonis/Core/Profiler'

import { Server } from '../src/Server'
import { serverConfig, fs, setupApp, encryption } from '../test-helpers'

test.group('Server | Response handling', (group) => {
  group.afterEach(async () => {
    await fs.cleanup()
  })

  test('invoke router handler', async (assert) => {
    const app = await setupApp()
    const server = new Server(app, encryption, serverConfig)
    const httpServer = createServer(server.handle.bind(server))

    server.router.get('/', async ({ response }) => response.send('handled'))
    server.optimize()

    const { text } = await supertest(httpServer).get('/').expect(200)
    assert.equal(text, 'handled')
  })

  test('use route handler return value when response.send is not called', async (assert) => {
    const app = await setupApp()
    const server = new Server(app, encryption, serverConfig)

    const httpServer = createServer(server.handle.bind(server))

    server.router.get('/', async () => 'handled')
    server.optimize()

    const { text } = await supertest(httpServer).get('/').expect(200)
    assert.equal(text, 'handled')
  })

  test('do not use return value when response.send is called', async (assert) => {
    const app = await setupApp()
    const server = new Server(app, encryption, serverConfig)

    const httpServer = createServer(server.handle.bind(server))

    server.router.get('/', async ({ response }) => {
      response.send('handled')
      return 'done'
    })
    server.optimize()

    const { text } = await supertest(httpServer).get('/').expect(200)
    assert.equal(text, 'handled')
  })

  test('pre process cookie max age', async (assert) => {
    const app = await setupApp()
    const server = new Server(
      app,
      encryption,
      Object.assign({}, serverConfig, {
        cookie: {
          maxAge: '2h',
        },
      })
    )

    const httpServer = createServer(server.handle.bind(server))

    server.router.get('/', async ({ response }) => {
      response.cookie('username', 'virk').send('handled')
    })
    server.optimize()

    const { header } = await supertest(httpServer).get('/').expect(200)
    assert.equal(header['set-cookie'][0].split(';')[1].trim(), 'Max-Age=7200')
  })

  test('redirect to given route with domain', async (assert) => {
    assert.plan(1)
    const app = await setupApp()
    const server = new Server(app, encryption, serverConfig)

    const httpServer = createServer(server.handle.bind(server))

    server.router
      .get('/guides/:doc', async ({ params }) => {
        assert.deepEqual(params, { doc: 'introduction' })
      })
      .as('guides')

    server.router.on('/docs/:doc').redirect('guides')
    server.optimize()

    await supertest(httpServer).get('/docs/introduction').redirects(1)
  })
})

test.group('Server | middleware', (group) => {
  group.afterEach(async () => {
    await fs.cleanup()
  })

  test('execute global middleware before route handler', async (assert) => {
    const stack: string[] = []

    const app = await setupApp()
    const server = new Server(app, encryption, serverConfig)

    const httpServer = createServer(server.handle.bind(server))

    server.router.get('/', async () => {
      stack.push('handler')
      return 'done'
    })

    server.middleware.register([
      async function middlewareFn1() {
        return {
          default: class Middleware {
            public async handle(_ctx: HttpContextContract, next: any) {
              stack.push('fn1')
              await next()
            }
          },
        }
      },
      async function middlewareFn1() {
        return {
          default: class Middleware {
            public async handle(_ctx: HttpContextContract, next: any) {
              stack.push('fn2')
              await next()
            }
          },
        }
      },
    ])

    server.optimize()

    await supertest(httpServer).get('/').expect(200)
    assert.deepEqual(stack, ['fn1', 'fn2', 'handler'])
  })

  test('execute global and route middleware before route handler', async (assert) => {
    const stack: string[] = []

    const app = await setupApp()
    const server = new Server(app, encryption, serverConfig)

    const httpServer = createServer(server.handle.bind(server))

    server.middleware.register([
      async function middlewareFn1() {
        return {
          default: class Middleware {
            public async handle(_ctx: HttpContextContract, next: any) {
              stack.push('fn1')
              await next()
            }
          },
        }
      },
      async function middlewareFn1() {
        return {
          default: class Middleware {
            public async handle(_ctx: HttpContextContract, next: any) {
              stack.push('fn2')
              await next()
            }
          },
        }
      },
    ])

    server.router
      .get('/', async () => {
        stack.push('handler')
        return 'done'
      })
      .middleware(async function routeMiddleware(_ctx: HttpContextContract, next: any) {
        stack.push('route fn1')
        await next()
      })

    server.optimize()

    await supertest(httpServer).get('/').expect(200)
    assert.deepEqual(stack, ['fn1', 'fn2', 'route fn1', 'handler'])
  })

  test('terminate request from global middleware', async (assert) => {
    const stack: string[] = []

    const app = await setupApp()
    const server = new Server(app, encryption, serverConfig)

    const httpServer = createServer(server.handle.bind(server))

    server.middleware.register([
      async function middlewareFn1() {
        return {
          default: class Middleware {
            public async handle(ctx: HttpContextContract) {
              stack.push('fn1')
              ctx.response.send('completed')
            }
          },
        }
      },
      async function middlewareFn1() {
        return {
          default: class Middleware {
            public async handle(_ctx: HttpContextContract, next: any) {
              stack.push('fn2')
              await next()
            }
          },
        }
      },
    ])

    server.router
      .get('/', async () => {
        stack.push('handler')
        return 'done'
      })
      .middleware(async function routeMiddleware(_ctx: HttpContextContract, next: any) {
        stack.push('route fn1')
        await next()
      })

    server.optimize()

    const { text } = await supertest(httpServer).get('/').expect(200)
    assert.deepEqual(stack, ['fn1'])
    assert.equal(text, 'completed')
  })

  test('terminate request from global middleware with exception', async (assert) => {
    const stack: string[] = []

    const app = await setupApp()
    const server = new Server(app, encryption, serverConfig)

    const httpServer = createServer(server.handle.bind(server))

    server.middleware.register([
      async function middlewareFn1() {
        return {
          default: class Middleware {
            public async handle() {
              stack.push('fn1')
              throw new Error('Cannot process')
            }
          },
        }
      },
      async function middlewareFn1() {
        return {
          default: class Middleware {
            public async handle(_ctx: HttpContextContract, next: any) {
              stack.push('fn2')
              await next()
            }
          },
        }
      },
    ])

    server.router
      .get('/', async () => {
        stack.push('handler')
        return 'done'
      })
      .middleware(async function routeMiddleware(_ctx: HttpContextContract, next: any) {
        stack.push('route fn1')
        await next()
      })

    server.optimize()

    const { text } = await supertest(httpServer).get('/').expect(500)
    assert.deepEqual(stack, ['fn1'])
    assert.equal(text, 'Cannot process')
  })

  test('terminate request from named middleware with exception', async (assert) => {
    const stack: string[] = []

    const app = await setupApp()
    const server = new Server(app, encryption, serverConfig)

    const httpServer = createServer(server.handle.bind(server))

    server.middleware.register([
      async function middlewareFn1() {
        return {
          default: class Middleware {
            public async handle(_ctx: HttpContextContract, next: any) {
              stack.push('fn1')
              await next()
            }
          },
        }
      },
      async function middlewareFn1() {
        return {
          default: class Middleware {
            public async handle(_ctx: HttpContextContract, next: any) {
              stack.push('fn2')
              await next()
            }
          },
        }
      },
    ])

    server.router
      .get('/', async () => {
        stack.push('handler')
        return 'done'
      })
      .middleware(async function routeMiddleware() {
        throw new Error('Short circuit')
      })

    server.optimize()

    const { text } = await supertest(httpServer).get('/').expect(500)
    assert.deepEqual(stack, ['fn1', 'fn2'])
    assert.equal(text, 'Short circuit')
  })

  test('terminate request from named middleware by not calling next', async (assert) => {
    const stack: string[] = []

    const app = await setupApp()
    const server = new Server(app, encryption, serverConfig)

    const httpServer = createServer(server.handle.bind(server))

    server.middleware.register([
      async function middlewareFn1() {
        return {
          default: class Middleware {
            public async handle(_ctx: HttpContextContract, next: any) {
              stack.push('fn1')
              await next()
            }
          },
        }
      },
      async function middlewareFn1() {
        return {
          default: class Middleware {
            public async handle(_ctx: HttpContextContract, next: any) {
              stack.push('fn2')
              await next()
            }
          },
        }
      },
    ])

    server.router
      .get('/', async () => {
        stack.push('handler')
        return 'done'
      })
      .middleware(async function routeMiddleware(_ctx: HttpContextContract) {
        stack.push('route fn1')
        _ctx.response.send('Short circuit')
      })

    server.optimize()

    const { text } = await supertest(httpServer).get('/').expect(200)
    assert.deepEqual(stack, ['fn1', 'fn2', 'route fn1'])
    assert.equal(text, 'Short circuit')
  })

  test('middleware must profile in the request scope', async (assert) => {
    const app = await setupApp()
    const server = new Server(app, encryption, serverConfig)

    let requestPacket: ProfilerRow
    let hookPacket: ProfilerAction

    server.router
      .get('/', async () => {
        return 'done'
      })
      .middleware(async function routeMiddleware(ctx, next) {
        ctx.profiler.profile('foo').end()
        return next()
      })

    server.optimize()

    app.profiler.process((packet) => {
      if (packet.label === 'foo') {
        hookPacket = packet as ProfilerAction
      } else {
        requestPacket = packet as ProfilerRow
      }
    })

    const httpServer = createServer(server.handle.bind(server))
    await supertest(httpServer).get('/').expect(200)

    assert.isDefined(hookPacket!.parent_id)
    assert.equal(hookPacket!.parent_id, requestPacket!.id)
  })

  test('upstream middleware must profile in the request scope', async (assert) => {
    const app = await setupApp()
    const server = new Server(app, encryption, serverConfig)

    let requestPacket: ProfilerRow
    let hookPacket: ProfilerAction

    server.router
      .get('/', async () => {
        return 'done'
      })
      .middleware(async function routeMiddleware(ctx, next) {
        await next()
        ctx.profiler.profile('foo').end()
      })

    server.optimize()

    app.profiler.process((packet) => {
      if (packet.label === 'foo') {
        hookPacket = packet as ProfilerAction
      } else {
        requestPacket = packet as ProfilerRow
      }
    })

    const httpServer = createServer(server.handle.bind(server))
    await supertest(httpServer).get('/').expect(200)

    assert.isDefined(hookPacket!.parent_id)
    assert.equal(hookPacket!.parent_id, requestPacket!.id)
  })
})

test.group('Server | hooks', (group) => {
  group.afterEach(async () => {
    await fs.cleanup()
  })

  test('execute all before hooks', async (assert) => {
    const stack: string[] = []

    const app = await setupApp()
    const server = new Server(app, encryption, serverConfig)

    server.hooks.before(async () => {
      stack.push('hook1')
    })
    server.hooks.before(async () => {
      stack.push('hook2')
    })

    const httpServer = createServer(server.handle.bind(server))
    server.optimize()

    await supertest(httpServer).get('/').expect(404)
    assert.deepEqual(stack, ['hook1', 'hook2'])
  })

  test('do not execute next hook when first raises error', async (assert) => {
    const stack: string[] = []

    const app = await setupApp()
    const server = new Server(app, encryption, serverConfig)

    server.hooks.before(async () => {
      stack.push('hook1')
      throw new Error('Blown away')
    })
    server.hooks.before(async () => {
      stack.push('hook2')
    })

    server.optimize()

    const httpServer = createServer(server.handle.bind(server))

    const { text } = await supertest(httpServer).get('/').expect(500)
    assert.equal(text, 'Blown away')
    assert.deepEqual(stack, ['hook1'])
  })

  test('do not execute next hook when first writes the body', async (assert) => {
    const stack: string[] = []

    const app = await setupApp()
    const server = new Server(app, encryption, serverConfig)

    server.hooks.before(async ({ response }) => {
      stack.push('hook1')
      response.send('done')
    })

    server.hooks.before(async () => {
      stack.push('hook2')
    })

    const httpServer = createServer(server.handle.bind(server))
    server.optimize()

    const { text } = await supertest(httpServer).get('/').expect(200)
    assert.equal(text, 'done')
    assert.deepEqual(stack, ['hook1'])
  })

  test('do not execute next hook when first writes the body in non-explicit mode', async (assert) => {
    const stack: string[] = []

    const app = await setupApp()
    const server = new Server(app, encryption, serverConfig)

    server.hooks.before(async ({ response }) => {
      stack.push('hook1')
      response.send('done')
    })

    server.hooks.before(async () => {
      stack.push('hook2')
    })

    const httpServer = createServer(server.handle.bind(server))
    server.optimize()

    const { text } = await supertest(httpServer).get('/').expect(200)
    assert.equal(text, 'done')
    assert.deepEqual(stack, ['hook1'])
  })

  test('execute after hooks before writing the response', async (assert) => {
    const stack: string[] = []

    const app = await setupApp()
    const server = new Server(app, encryption, serverConfig)

    server.hooks.before(async () => {
      stack.push('hook1')
    })

    server.hooks.before(async () => {
      stack.push('hook2')
    })

    server.hooks.after(async () => {
      stack.push('after hook1')
    })

    server.router.get('/', async () => {
      stack.push('handler')
      return 'done'
    })

    server.optimize()

    const httpServer = createServer(server.handle.bind(server))

    const { text } = await supertest(httpServer).get('/').expect(200)
    assert.equal(text, 'done')
    assert.deepEqual(stack, ['hook1', 'hook2', 'handler', 'after hook1'])
  })

  test('execute after hooks when route handler raises error', async (assert) => {
    const stack: string[] = []

    const app = await setupApp()
    const server = new Server(app, encryption, serverConfig)

    server.hooks.before(async () => {
      stack.push('hook1')
    })

    server.hooks.before(async () => {
      stack.push('hook2')
    })

    server.hooks.after(async () => {
      stack.push('after hook1')
    })

    server.router.get('/', async () => {
      stack.push('handler')
      throw new Error('handler error')
    })

    server.optimize()

    const httpServer = createServer(server.handle.bind(server))

    const { text } = await supertest(httpServer).get('/').expect(500)
    assert.equal(text, 'handler error')
    assert.deepEqual(stack, ['hook1', 'hook2', 'handler', 'after hook1'])
  })

  test('execute after hooks when route is missing', async (assert) => {
    const stack: string[] = []

    const app = await setupApp()
    const server = new Server(app, encryption, serverConfig)

    server.hooks.before(async () => {
      stack.push('hook1')
    })

    server.hooks.before(async () => {
      stack.push('hook2')
    })

    server.hooks.after(async () => {
      stack.push('after hook1')
    })

    server.optimize()

    const httpServer = createServer(server.handle.bind(server))

    const { text } = await supertest(httpServer).get('/').expect(404)
    assert.equal(text, 'E_ROUTE_NOT_FOUND: Cannot GET:/')
    assert.deepEqual(stack, ['hook1', 'hook2', 'after hook1'])
  })

  test('execute after hooks when before hook raises error', async (assert) => {
    const stack: string[] = []

    const app = await setupApp()
    const server = new Server(app, encryption, serverConfig)

    server.hooks.before(async () => {
      stack.push('hook1')
      throw new Error('Short circuit')
    })

    server.hooks.before(async () => {
      stack.push('hook2')
    })

    server.hooks.after(async () => {
      stack.push('after hook1')
    })

    server.optimize()

    const httpServer = createServer(server.handle.bind(server))

    const { text } = await supertest(httpServer).get('/').expect(500)
    assert.equal(text, 'Short circuit')
    assert.deepEqual(stack, ['hook1', 'after hook1'])
  })

  test('execute after hooks when before hook writes response', async (assert) => {
    const stack: string[] = []

    const app = await setupApp()
    const server = new Server(app, encryption, serverConfig)

    server.hooks.before(async ({ response }) => {
      stack.push('hook1')
      response.send('handled inside before hook')
    })

    server.hooks.before(async () => {
      stack.push('hook2')
    })

    server.hooks.after(async ({ response }) => {
      stack.push('after hook1')
      response.send('updated inside after hook')
    })

    server.optimize()

    const httpServer = createServer(server.handle.bind(server))

    const { text } = await supertest(httpServer).get('/').expect(200)
    assert.equal(text, 'updated inside after hook')
    assert.deepEqual(stack, ['hook1', 'after hook1'])
  })

  test('catch after hook errors', async (assert) => {
    const stack: string[] = []

    const app = await setupApp()
    const server = new Server(app, encryption, serverConfig)

    server.hooks.before(async () => {
      stack.push('hook1')
    })

    server.hooks.before(async () => {
      stack.push('hook2')
    })

    server.hooks.after(async () => {
      stack.push('after hook1')
      throw new Error('Unexpected error')
    })

    server.optimize()

    const httpServer = createServer(server.handle.bind(server))

    const { text } = await supertest(httpServer).get('/').expect(500)
    assert.equal(text, 'Unexpected error')
    assert.deepEqual(stack, ['hook1', 'hook2', 'after hook1'])
  })

  test('allow after hooks to set headers when route handler raises an exception', async (assert) => {
    const stack: string[] = []

    const app = await setupApp()
    const server = new Server(app, encryption, serverConfig)

    server.hooks.before(async () => {
      stack.push('hook1')
    })

    server.hooks.before(async () => {
      stack.push('hook2')
    })

    server.hooks.after(async ({ response }) => {
      stack.push('after hook1')
      response.header('x-after-hook', true)
    })

    server.router.get('/', () => {
      throw new Error('What??')
    })

    server.optimize()

    const httpServer = createServer(server.handle.bind(server))

    const { text, header } = await supertest(httpServer).get('/').expect(500)
    assert.property(header, 'x-after-hook')
    assert.equal(text, 'What??')
    assert.deepEqual(stack, ['hook1', 'hook2', 'after hook1'])
  })

  test('after hooks must profile in the request scope', async (assert) => {
    const app = await setupApp()
    const server = new Server(app, encryption, serverConfig)

    let requestPacket: ProfilerRow
    let hookPacket: ProfilerAction

    server.hooks.after(async (ctx) => {
      ctx.profiler.profile('foo').end()
    })

    server.router.get('/', async () => {
      return 'done'
    })

    server.optimize()

    app.profiler.process((packet) => {
      if (packet.label === 'foo') {
        hookPacket = packet as ProfilerAction
      } else {
        requestPacket = packet as ProfilerRow
      }
    })

    const httpServer = createServer(server.handle.bind(server))
    await supertest(httpServer).get('/').expect(200)

    assert.equal(hookPacket!.parent_id, requestPacket!.id)
  })
})

test.group('Server | error handler', (group) => {
  group.afterEach(async () => {
    await fs.cleanup()
  })

  test('pass before hook errors to error handler', async (assert) => {
    const app = await setupApp()
    const server = new Server(app, encryption, serverConfig)

    server.errorHandler(async (_error, { response }) => {
      response.status(200).send('handled by error handler')
    })

    server.hooks.before(async () => {
      throw new Error('Bump')
    })

    server.optimize()

    const httpServer = createServer(server.handle.bind(server))

    const { text } = await supertest(httpServer).get('/').expect(200)
    assert.equal(text, 'handled by error handler')
  })

  test('pass route handler errors to error handler', async (assert) => {
    const app = await setupApp()
    const server = new Server(app, encryption, serverConfig)

    server.errorHandler(async (_error, { response }) => {
      response.status(200).send('handled by error handler')
    })

    server.router.get('/', async () => {
      throw new Error('bump')
    })

    server.optimize()

    const httpServer = createServer(server.handle.bind(server))

    const { text } = await supertest(httpServer).get('/').expect(200)
    assert.equal(text, 'handled by error handler')
  })

  test('pass middleware error to custom error handler', async (assert) => {
    const app = await setupApp()
    const server = new Server(app, encryption, serverConfig)

    server.errorHandler(async (_error, { response }) => {
      response.status(200).send('handled by error handler')
    })

    server.middleware.register([
      async function middleware() {
        throw new Error('bump')
      },
    ])

    server.router.get('/', async () => {
      return 'handled by route'
    })

    server.optimize()

    const httpServer = createServer(server.handle.bind(server))

    const { text } = await supertest(httpServer).get('/').expect(200)
    assert.equal(text, 'handled by error handler')
  })

  test('pass after hooks error to custom error handler', async (assert) => {
    const app = await setupApp()
    const server = new Server(app, encryption, serverConfig)

    server.errorHandler(async (_error, { response }) => {
      response.send('handled by error handler')
    })

    server.hooks.after(async function afterHook() {
      throw new Error('Bump')
    })

    server.optimize()

    const httpServer = createServer(server.handle.bind(server))

    const { text } = await supertest(httpServer).get('/').expect(500)
    assert.equal(text, 'handled by error handler')
  })

  test('pass missing route error to error handler', async (assert) => {
    const app = await setupApp()
    const server = new Server(app, encryption, serverConfig)

    server.errorHandler(async (_error, { response }) => {
      response.send('handled by error handler')
    })

    server.optimize()

    const httpServer = createServer(server.handle.bind(server))

    const { text } = await supertest(httpServer).get('/').expect(404)
    assert.equal(text, 'handled by error handler')
  })

  test('bind ioc container reference as error handler', async (assert) => {
    class Reporter {
      public getMessage() {
        return 'handled by error handler'
      }
    }

    class ErrorHandler {
      @inject()
      public async handle(_error: any, { response }, reporter: Reporter) {
        response.status(200).send(reporter.getMessage())
      }
    }

    const app = await setupApp()
    app.container.bind('App/Exceptions/Handler', () => new ErrorHandler())

    const server = new Server(app, encryption, serverConfig)
    server.errorHandler('App/Exceptions/Handler')

    server.router.get('/', async () => {
      throw new Error('bump')
    })

    server.optimize()

    const httpServer = createServer(server.handle.bind(server))

    const { text } = await supertest(httpServer).get('/').expect(200)
    assert.equal(text, 'handled by error handler')
  })

  test('call report method on the error handler', async (assert) => {
    assert.plan(2)

    class ErrorHandler {
      @inject()
      public async handle(_error: any, { response }) {
        response.status(200).send('handled by error handler')
      }

      public async report(error: any) {
        assert.equal(error.message, 'bump')
      }
    }

    const app = await setupApp()
    app.container.bind('App/Exceptions/Handler', () => new ErrorHandler())
    const server = new Server(app, encryption, serverConfig)
    server.errorHandler('App/Exceptions/Handler')

    server.router.get('/', async () => {
      throw new Error('bump')
    })

    server.optimize()

    const httpServer = createServer(server.handle.bind(server))

    const { text } = await supertest(httpServer).get('/').expect(200)
    assert.equal(text, 'handled by error handler')
  })

  test('pass response toJSON error to error handler', async (assert) => {
    const app = await setupApp()
    const server = new Server(app, encryption, serverConfig)

    server.errorHandler(async (_error, { response }) => {
      response.send('handled by error handler')
    })

    server.router.get('/', async () => {
      return {
        toJSON() {
          throw new Error('blowup')
        },
      }
    })

    server.optimize()
    const httpServer = createServer(server.handle.bind(server))

    const { text } = await supertest(httpServer).get('/').expect(500)
    assert.equal(text, 'handled by error handler')
  })
})

test.group('Server | all', (group) => {
  group.afterEach(async () => {
    await fs.cleanup()
  })

  group.afterEach(() => {
    delete global[Symbol.for('ioc.use')]
    delete global[Symbol.for('ioc.call')]
    delete global[Symbol.for('ioc.make')]
  })

  test('raise 404 when route is missing', async (assert) => {
    const app = await setupApp()
    const server = new Server(app, encryption, serverConfig)

    server.optimize()

    const httpServer = createServer(server.handle.bind(server))

    const { text } = await supertest(httpServer).get('/').expect(404)
    assert.equal(text, 'E_ROUTE_NOT_FOUND: Cannot GET:/')
  })

  test('execute IoC container controller binding by injecting dependencies', async (assert) => {
    class User {
      public username = 'virk'
    }

    class HomeController {
      @inject()
      public async index(_ctx: HttpContextContract, user: User) {
        return user.username
      }
    }

    const app = await setupApp()
    app.container.bind('App/Controllers/Http/HomeController', () => new HomeController())

    const server = new Server(app, encryption, serverConfig)
    server.router.get('/', 'HomeController.index')
    server.optimize()

    const httpServer = createServer(server.handle.bind(server))

    const { text } = await supertest(httpServer).get('/')
    assert.equal(text, 'virk')
  })

  test('execute IoC container middleware binding by injecting dependencies', async (assert) => {
    class User {
      public username = 'virk'
    }

    class AuthMiddleware {
      @inject()
      public async handle(ctx: HttpContextContract, next: any, _args: any, user: User) {
        ctx['user'] = user
        await next()
      }
    }

    const app = await setupApp()
    app.container.bind('App/Middleware/Auth', () => new AuthMiddleware())

    const server = new Server(app, encryption, serverConfig)

    server.middleware.registerNamed({
      auth: 'App/Middleware/Auth',
    })

    server.router
      .get('/', (ctx: HttpContextContract) => {
        return ctx['user'].username
      })
      .middleware('auth')

    server.optimize()

    const httpServer = createServer(server.handle.bind(server))

    const { text } = await supertest(httpServer).get('/')
    assert.equal(text, 'virk')
  })

  test('set accept header when forceContentNegotiationToJson is true', async (assert) => {
    const app = await setupApp()
    const server = new Server(
      app,
      encryption,
      Object.assign({}, serverConfig, {
        forceContentNegotiationToJSON: true,
      })
    )

    const httpServer = createServer(server.handle.bind(server))

    server.router.get('/', async ({ request, response }) => response.send(request.header('accept')))
    server.optimize()

    const { text } = await supertest(httpServer).get('/').expect(200)
    assert.equal(text, 'application/json')
  })

  test('pass routeKey to the context', async (assert) => {
    const app = await setupApp()
    const server = new Server(
      app,
      encryption,
      Object.assign({}, serverConfig, {
        forceContentNegotiationToJSON: true,
      })
    )

    const httpServer = createServer(server.handle.bind(server))
    server.router.get('/', async ({ routeKey, response }) => response.send(routeKey))
    server.optimize()

    const { text } = await supertest(httpServer).get('/').expect(200)
    assert.equal(text, 'GET-/')
  })
})
