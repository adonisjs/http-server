/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { AppFactory } from '@adonisjs/application/factories'
import { BriskRoute } from '../../src/router/brisk.js'

const BASE_URL = new URL('./app/', import.meta.url)

test.group('Brisk Route', () => {
  test('define handler for the route', ({ assert }) => {
    const app = new AppFactory().create(BASE_URL, () => {})

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

  test('define handler via the redirect method', ({ assert }) => {
    const app = new AppFactory().create(BASE_URL, () => {})

    const brisk = new BriskRoute(app, [], {
      pattern: '/',
      globalMatchers: {},
    })
    // @ts-expect-error "Because RoutesList is empty"
    const route = brisk.redirect('/:page', { page: 'home' }).toJSON()

    assert.isFunction(route.handler)
    assert.equal('listArgs' in route.handler && route.handler.listArgs, '/:page')
  })

  test('define handler via the redirectToPath method', ({ assert }) => {
    const app = new AppFactory().create(BASE_URL, () => {})

    const brisk = new BriskRoute(app, [], {
      pattern: '/',
      globalMatchers: {},
    })

    const route = brisk.redirectToPath('/home').toJSON()

    assert.isFunction(route.handler)
    assert.equal('listArgs' in route.handler && route.handler.listArgs, '/home')
  })
})
