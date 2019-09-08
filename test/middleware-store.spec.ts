/*
 * @adonisjs/server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'
import { Ioc } from '@adonisjs/fold'
import { MiddlewareStore } from '../src/MiddlewareStore'

test.group('Middleware', () => {
  test('register global middleware', (assert) => {
    const middleware = new MiddlewareStore(new Ioc())
    async function handler () {}

    middleware.register([handler])
    assert.deepEqual(middleware.get(), [{
      type: 'function',
      value: handler,
      args: [],
    }])
  })

  test('register named middleware', (assert) => {
    const middleware = new MiddlewareStore(new Ioc())
    async function handler () {}

    middleware.registerNamed({ auth: handler })
    assert.deepEqual(middleware['_named'], {
      auth: { type: 'function', value: handler, args: [] },
    })
  })

  test('get named middleware', (assert) => {
    const middleware = new MiddlewareStore(new Ioc())
    async function handler () {}

    middleware.registerNamed({ auth: handler })
    assert.deepEqual(middleware.getNamed('auth'), {
      type: 'function', value: handler, args: [],
    })
  })

  test('return null when middleware doesn\'t exists', (assert) => {
    const middleware = new MiddlewareStore(new Ioc())
    assert.isNull(middleware.getNamed('auth'))
  })

  test('invoke resolved middleware', async (assert) => {
    const stack: any[] = []
    async function middlewareFn () {
      stack.push('middlewareFn')
    }

    const middleware = new MiddlewareStore(new Ioc())
    middleware.register([middlewareFn])
    middleware.invokeMiddleware(middleware.get()[0], [] as any)
    assert.deepEqual(stack, ['middlewareFn'])
  })

  test('invoke middleware by resolving them from IoC container', async (assert) => {
    const stack: any[] = []

    class Middleware {
      public async handle () {
        stack.push('middleware class')
      }
    }

    const ioc = new Ioc()
    ioc.bind('App/Middleware', () => new Middleware())

    const middleware = new MiddlewareStore(ioc)
    middleware.register(['App/Middleware'])
    middleware.invokeMiddleware(middleware.get()[0], [] as any)
    assert.deepEqual(stack, ['middleware class'])
  })
})
