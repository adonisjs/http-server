/**
 * @adonisjs/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Ioc } from '@adonisjs/fold'
import { MiddlewareStore } from '../src/MiddlewareStore'

test.group('Middleware', () => {
  test('register global middleware', ({ assert }) => {
    const middleware = new MiddlewareStore(new Ioc())
    class GlobalMiddleware {
      public async handle() {}
    }

    const handler = () => Promise.resolve({ default: GlobalMiddleware })

    middleware.register([handler])
    assert.deepEqual(middleware.get(), [
      {
        type: 'lazy-import',
        value: handler,
        args: [],
      },
    ])
  })

  test('clear global middleware', ({ assert }) => {
    const middleware = new MiddlewareStore(new Ioc())
    class GlobalMiddleware {
      public async handle() {}
    }

    const handler = () => Promise.resolve({ default: GlobalMiddleware })

    middleware.register([handler])
    middleware.clear()
    assert.deepEqual(middleware.get(), [])
  })

  test('register named middleware', ({ assert }) => {
    const middleware = new MiddlewareStore(new Ioc())
    class GlobalMiddleware {
      public async handle() {}
    }

    const handler = () => Promise.resolve({ default: GlobalMiddleware })

    middleware.registerNamed({ auth: handler })
    assert.deepEqual(middleware['named'], {
      auth: { type: 'lazy-import', value: handler, args: [] },
    })
  })

  test('clear select or all named middleware', ({ assert }) => {
    const middleware = new MiddlewareStore(new Ioc())
    class GlobalMiddleware {
      public async handle() {}
    }

    const handler = () => Promise.resolve({ default: GlobalMiddleware })

    middleware.registerNamed({ auth: handler, acl: handler })
    middleware.clearNamed(['auth'])
    assert.deepEqual(middleware['named'], {
      acl: { type: 'lazy-import', value: handler, args: [] },
    })

    middleware.clearNamed()
    assert.deepEqual(middleware['named'], {})
  })

  test('get named middleware', ({ assert }) => {
    const middleware = new MiddlewareStore(new Ioc())
    class GlobalMiddleware {
      public async handle() {}
    }

    const handler = () => Promise.resolve({ default: GlobalMiddleware })

    middleware.registerNamed({ auth: handler })
    assert.deepEqual(middleware.getNamed('auth'), {
      type: 'lazy-import',
      value: handler,
      args: [],
    })
  })

  test("return null when middleware doesn't exists", ({ assert }) => {
    const middleware = new MiddlewareStore(new Ioc())
    assert.isNull(middleware.getNamed('auth'))
  })

  test('invoke resolved middleware', async ({ assert }) => {
    const stack: any[] = []

    class GlobalMiddleware {
      public async handle() {
        stack.push('middlewareFn')
      }
    }

    const handler = () => Promise.resolve({ default: GlobalMiddleware })

    const middleware = new MiddlewareStore(new Ioc())
    middleware.register([handler])
    await middleware.invokeMiddleware(middleware.get()[0], [] as any)
    assert.deepEqual(stack, ['middlewareFn'])
  })

  test('invoke middleware by resolving them from IoC container', async ({ assert }) => {
    const stack: any[] = []

    class Middleware {
      public async handle() {
        stack.push('middleware class')
      }
    }

    const ioc = new Ioc()
    ioc.bind('App/Middleware', () => new Middleware())

    const middleware = new MiddlewareStore(ioc)
    middleware.register(['App/Middleware'])
    await middleware.invokeMiddleware(middleware.get()[0], [] as any)
    assert.deepEqual(stack, ['middleware class'])
  })
})
