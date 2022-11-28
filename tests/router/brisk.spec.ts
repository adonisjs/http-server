/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Application } from '@adonisjs/application'

import { BriskRoute } from '../../src/router/brisk.js'
import { MiddlewareStore } from '../../src/middleware/store.js'

const BASE_URL = new URL('./app/', import.meta.url)

test.group('Brisk Route', () => {
  test('define handler for the route', ({ assert }) => {
    const app = new Application(BASE_URL, { environment: 'web' })
    const middlewareStore = new MiddlewareStore([], {})

    const brisk = new BriskRoute(app, middlewareStore, {
      pattern: '/',
      globalMatchers: {},
    })
    async function handler() {}

    const route = brisk.setHandler(handler)
    assert.deepEqual(route.toJSON(), {
      domain: 'root',
      handler,
      matchers: {},
      meta: {},
      methods: ['GET', 'HEAD'],
      middleware: [],
      name: undefined,
      pattern: '/',
    })
  })

  test('define handler after calling the redirect method', ({ assert }) => {
    const app = new Application(BASE_URL, { environment: 'web' })
    const middlewareStore = new MiddlewareStore([], {})

    const brisk = new BriskRoute(app, middlewareStore, {
      pattern: '/',
      globalMatchers: {},
    })
    const route = brisk.redirect('/:page', { page: 'home' })
    assert.isFunction(route.toJSON().handler)
  })

  test('define handler after calling the redirectToPath method', ({ assert }) => {
    const app = new Application(BASE_URL, { environment: 'web' })
    const middlewareStore = new MiddlewareStore([], {})

    const brisk = new BriskRoute(app, middlewareStore, {
      pattern: '/',
      globalMatchers: {},
    })
    const route = brisk.redirectToPath('/home')
    assert.isFunction(route.toJSON().handler)
  })
})
