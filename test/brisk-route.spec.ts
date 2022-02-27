/**
 * @adonisjs/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { BriskRoute } from '../src/Router/BriskRoute'

test.group('Brisk Route', () => {
  test('define handler for the route', ({ assert }) => {
    const brisk = new BriskRoute('/', {})
    async function handler() {}

    const route = brisk.setHandler(handler, 'render')
    assert.deepEqual(route.toJSON(), {
      domain: 'root',
      handler,
      matchers: {},
      meta: {
        namespace: undefined,
      },
      methods: ['HEAD', 'GET'],
      middleware: [],
      name: undefined,
      pattern: '/',
    })
  })

  test('setting handler multiple times must result in error', ({ assert }) => {
    const brisk = new BriskRoute('/', {})
    async function handler() {}

    brisk.setHandler(handler, 'render')
    const fn = () => brisk.setHandler(handler, 'respond')

    assert.throws(
      fn,
      'E_MULTIPLE_BRISK_HANDLERS: `Route.respond` and `render` cannot be called together'
    )
  })
})
