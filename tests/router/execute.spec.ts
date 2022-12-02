/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import type { NextFn } from '@poppinss/middleware/types'

import { Route } from '../../src/router/route.js'
import { AppFactory } from '../../test_factories/app.js'
import { MiddlewareStore } from '../../src/middleware/store.js'
import type { HttpContext } from '../../src/http_context/main.js'
import { HttpContextFactory } from '../../test_factories/http_context.js'

test.group('Route | execute', () => {
  test('execute route handler function', async ({ assert }) => {
    assert.plan(2)

    const stack: string[] = []
    const app = new AppFactory().create()
    await app.init()

    const context = new HttpContextFactory().create()
    const middlewareStore = new MiddlewareStore([], {})

    async function handler(ctx: HttpContext) {
      stack.push('handler')
      assert.strictEqual(ctx, context)
    }

    const route = new Route(app, middlewareStore, {
      pattern: '/',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })

    const routeJSON = route.toJSON()
    await routeJSON.execute(routeJSON, app.container.createResolver(), context)
    assert.deepEqual(stack, ['handler'])
  })

  test('execute route contoller', async ({ assert }) => {
    assert.plan(3)

    const stack: string[] = []
    const app = new AppFactory().create()
    await app.init()

    const resolver = app.container.createResolver()

    const context = new HttpContextFactory().create()
    const middlewareStore = new MiddlewareStore([], {})

    const route = new Route(app, middlewareStore, {
      pattern: '/',
      methods: ['GET'],
      handler: () => {},
      globalMatchers: {},
    })

    const routeJSON = route.toJSON()

    routeJSON.handler = {
      name: '#controllers/home',
      handle(container, ctx) {
        assert.strictEqual(container, resolver)
        assert.strictEqual(ctx, context)
        stack.push('controller')
      },
    }

    await routeJSON.execute(routeJSON, resolver, context)
    assert.deepEqual(stack, ['controller'])
  })

  test('execute route middleware defined as a function', async ({ assert }) => {
    assert.plan(4)

    const stack: string[] = []
    const app = new AppFactory().create()
    await app.init()

    const context = new HttpContextFactory().create()
    const middlewareStore = new MiddlewareStore([], {})

    async function handler(ctx: HttpContext) {
      stack.push('handler')
      assert.strictEqual(ctx, context)
    }

    const route = new Route(app, middlewareStore, {
      pattern: '/',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })

    route.middleware((ctx, next) => {
      stack.push('middleware 1')
      assert.strictEqual(ctx, context)
      return next()
    })
    route.middleware((ctx, next) => {
      stack.push('middleware 2')
      assert.strictEqual(ctx, context)
      return next()
    })

    const routeJSON = route.toJSON()
    await routeJSON.execute(routeJSON, app.container.createResolver(), context)
    assert.deepEqual(stack, ['middleware 1', 'middleware 2', 'handler'])
  })

  test('do not execute handler when middleware does not call the next method', async ({
    assert,
  }) => {
    assert.plan(3)

    const stack: string[] = []
    const app = new AppFactory().create()
    await app.init()

    const context = new HttpContextFactory().create()
    const middlewareStore = new MiddlewareStore([], {})

    async function handler(ctx: HttpContext) {
      stack.push('handler')
      assert.strictEqual(ctx, context)
    }

    const route = new Route(app, middlewareStore, {
      pattern: '/',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })

    route.middleware((ctx, next) => {
      stack.push('middleware 1')
      assert.strictEqual(ctx, context)
      return next()
    })
    route.middleware((ctx) => {
      stack.push('middleware 2')
      assert.strictEqual(ctx, context)
    })

    const routeJSON = route.toJSON()
    await routeJSON.execute(routeJSON, app.container.createResolver(), context)
    assert.deepEqual(stack, ['middleware 1', 'middleware 2'])
  })

  test('execute global middleware before the route middleware', async ({ assert }) => {
    assert.plan(6)

    const stack: string[] = []
    const app = new AppFactory().create()
    await app.init()

    class BodyParserMiddleware {
      async handle(ctx: HttpContext, next: NextFn) {
        stack.push('bodyparser')
        assert.strictEqual(ctx, context)
        return next()
      }
    }

    class LogMiddleware {
      async handle(ctx: HttpContext, next: NextFn) {
        stack.push('log')
        assert.strictEqual(ctx, context)
        return next()
      }
    }

    const context = new HttpContextFactory().create()
    const middlewareStore = new MiddlewareStore(
      [
        async () => {
          return {
            default: BodyParserMiddleware,
          }
        },
        async () => {
          return {
            default: LogMiddleware,
          }
        },
      ],
      {}
    )

    async function handler(ctx: HttpContext) {
      stack.push('handler')
      assert.strictEqual(ctx, context)
    }

    const route = new Route(app, middlewareStore, {
      pattern: '/',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })

    route.middleware((ctx, next) => {
      stack.push('middleware 1')
      assert.strictEqual(ctx, context)
      return next()
    })
    route.middleware((ctx, next) => {
      stack.push('middleware 2')
      assert.strictEqual(ctx, context)
      return next()
    })

    const routeJSON = route.toJSON()
    await routeJSON.execute(routeJSON, app.container.createResolver(), context)
    assert.deepEqual(stack, ['bodyparser', 'log', 'middleware 1', 'middleware 2', 'handler'])
  })

  test('do not run route middleware when global middleware does not call next', async ({
    assert,
  }) => {
    assert.plan(3)

    const stack: string[] = []
    const app = new AppFactory().create()
    await app.init()

    class BodyParserMiddleware {
      async handle(ctx: HttpContext, next: NextFn) {
        stack.push('bodyparser')
        assert.strictEqual(ctx, context)
        return next()
      }
    }

    class LogMiddleware {
      async handle(ctx: HttpContext) {
        stack.push('log')
        assert.strictEqual(ctx, context)
      }
    }

    const context = new HttpContextFactory().create()
    const middlewareStore = new MiddlewareStore(
      [
        async () => {
          return {
            default: BodyParserMiddleware,
          }
        },
        async () => {
          return {
            default: LogMiddleware,
          }
        },
      ],
      {}
    )

    async function handler(ctx: HttpContext) {
      stack.push('handler')
      assert.strictEqual(ctx, context)
    }

    const route = new Route(app, middlewareStore, {
      pattern: '/',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })

    route.middleware((ctx, next) => {
      stack.push('middleware 1')
      assert.strictEqual(ctx, context)
      return next()
    })
    route.middleware((ctx, next) => {
      stack.push('middleware 2')
      assert.strictEqual(ctx, context)
      return next()
    })

    const routeJSON = route.toJSON()
    await routeJSON.execute(routeJSON, app.container.createResolver(), context)
    assert.deepEqual(stack, ['bodyparser', 'log'])
  })

  test('catch global middleware exceptions', async ({ assert }) => {
    const stack: string[] = []
    const app = new AppFactory().create()
    await app.init()

    class BodyParserMiddleware {
      async handle(_: HttpContext, next: NextFn) {
        stack.push('bodyparser')
        return next()
      }
    }

    class LogMiddleware {
      async handle(_: HttpContext) {
        stack.push('log')
        throw new Error('Log middleware failed')
      }
    }

    const context = new HttpContextFactory().create()
    const middlewareStore = new MiddlewareStore(
      [
        async () => {
          return {
            default: BodyParserMiddleware,
          }
        },
        async () => {
          return {
            default: LogMiddleware,
          }
        },
      ],
      {}
    )

    async function handler(ctx: HttpContext) {
      stack.push('handler')
      assert.strictEqual(ctx, context)
    }

    const route = new Route(app, middlewareStore, {
      pattern: '/',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })

    route.middleware((ctx, next) => {
      stack.push('middleware 1')
      assert.strictEqual(ctx, context)
      return next()
    })
    route.middleware((ctx, next) => {
      stack.push('middleware 2')
      assert.strictEqual(ctx, context)
      return next()
    })

    const routeJSON = route.toJSON()
    await assert.rejects(
      () => routeJSON.execute(routeJSON, app.container.createResolver(), context),
      'Log middleware failed'
    )

    assert.deepEqual(stack, ['bodyparser', 'log'])
  })

  test('catch route handler exceptions', async ({ assert }) => {
    const stack: string[] = []
    const app = new AppFactory().create()
    await app.init()

    class BodyParserMiddleware {
      async handle(_: HttpContext, next: NextFn) {
        stack.push('bodyparser')
        return next()
      }
    }

    class LogMiddleware {
      async handle(_: HttpContext, next: NextFn) {
        stack.push('log')
        return next()
      }
    }

    const context = new HttpContextFactory().create()
    const middlewareStore = new MiddlewareStore(
      [
        async () => {
          return {
            default: BodyParserMiddleware,
          }
        },
        async () => {
          return {
            default: LogMiddleware,
          }
        },
      ],
      {}
    )

    async function handler() {
      throw new Error('route handler failed')
    }

    const route = new Route(app, middlewareStore, {
      pattern: '/',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })

    route.middleware((ctx, next) => {
      stack.push('middleware 1')
      assert.strictEqual(ctx, context)
      return next()
    })
    route.middleware((ctx, next) => {
      stack.push('middleware 2')
      assert.strictEqual(ctx, context)
      return next()
    })

    const routeJSON = route.toJSON()
    await assert.rejects(
      () => routeJSON.execute(routeJSON, app.container.createResolver(), context),
      'route handler failed'
    )

    assert.deepEqual(stack, ['bodyparser', 'log', 'middleware 1', 'middleware 2'])
  })

  test('pass arguments to the named middleware', async ({ assert }) => {
    const stack: any[] = []
    const app = new AppFactory().create()
    await app.init()

    class AclMiddleware {
      async handle(ctx: HttpContext, next: NextFn, options?: { role: 'admin' | 'editor' }) {
        stack.push(options)
        assert.strictEqual(ctx, context)
        return next()
      }
    }

    const context = new HttpContextFactory().create()
    const middlewareStore = new MiddlewareStore([], {
      acl: async () => {
        return {
          default: AclMiddleware,
        }
      },
    })

    async function handler(ctx: HttpContext) {
      stack.push('handler')
      assert.strictEqual(ctx, context)
    }

    const route = new Route(app, middlewareStore, {
      pattern: '/',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })
    route.middleware('acl')

    const route1 = new Route(app, middlewareStore, {
      pattern: '/',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })
    route1.middleware('acl', { role: 'admin' })

    const routeJSON = route.toJSON()
    await routeJSON.execute(routeJSON, app.container.createResolver(), context)
    assert.deepEqual(stack, [undefined, 'handler'])

    const route1JSON = route1.toJSON()
    await route1JSON.execute(route1JSON, app.container.createResolver(), context)
    assert.deepEqual(stack, [undefined, 'handler', { role: 'admin' }, 'handler'])
  })
})
