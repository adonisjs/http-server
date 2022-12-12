/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'

import { BriskRoute } from '../../src/router/brisk.js'
import { AppFactory } from '../../test_factories/app.js'

test.group('Brisk Route', () => {
  test('define handler for the route', ({ assert }) => {
    const app = new AppFactory().create()

    const brisk = new BriskRoute(app, [], {
      pattern: '/',
      globalMatchers: {},
    })
    async function handler() {}

    const route = brisk.setHandler(handler)
    assert.containsSubset(route.toJSON(), {
      domain: 'root',
      handler,
      matchers: {},
      meta: {},
      methods: ['GET', 'HEAD'],
      name: undefined,
      pattern: '/',
    })
  })

  test('define handler after calling the redirect method', ({ assert }) => {
    const app = new AppFactory().create()

    const brisk = new BriskRoute(app, [], {
      pattern: '/',
      globalMatchers: {},
    })
    const route = brisk.redirect('/:page', { page: 'home' })
    assert.isFunction(route.toJSON().handler)
  })

  test('define handler after calling the redirectToPath method', ({ assert }) => {
    const app = new AppFactory().create()

    const brisk = new BriskRoute(app, [], {
      pattern: '/',
      globalMatchers: {},
    })
    const route = brisk.redirectToPath('/home')
    assert.isFunction(route.toJSON().handler)
  })
})
