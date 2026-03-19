/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { createUrlBuilder } from '../../src/client/url_builder.ts'
import type { ClientRouteJSON } from '../../src/client/types.ts'

function makeRoutes(routes: ClientRouteJSON[]) {
  return { root: routes }
}

function stringifier(params: Record<string, any>) {
  return new URLSearchParams(params).toString()
}

const usersIndex: ClientRouteJSON = {
  name: 'users.index',
  pattern: '/users',
  tokens: [{ old: '/users', type: 0, val: 'users', end: '' }],
  methods: ['GET'],
  domain: 'root',
}

test.group('Client URLBuilder | defaultOptions', () => {
  test('defaultOptions prefixUrl is applied to all generated URLs', ({ assert }) => {
    const urlFor = createUrlBuilder(makeRoutes([usersIndex]), stringifier, {
      prefixUrl: 'https://api.example.com',
    })

    assert.equal(urlFor('users.index'), 'https://api.example.com/users')
  })

  test('defaultOptions prefixUrl works with method-specific builders', ({ assert }) => {
    const urlFor = createUrlBuilder(makeRoutes([usersIndex]), stringifier, {
      prefixUrl: 'https://api.example.com',
    })

    assert.equal(urlFor.get('users.index').url, 'https://api.example.com/users')
    assert.equal(urlFor.get('users.index').form.action, 'https://api.example.com/users')
    assert.equal(`${urlFor.get('users.index')}`, 'https://api.example.com/users')
  })

  test('per-call prefixUrl overrides defaultOptions prefixUrl', ({ assert }) => {
    const urlFor = createUrlBuilder(makeRoutes([usersIndex]), stringifier, {
      prefixUrl: 'https://api.example.com',
    })

    assert.equal(
      urlFor('users.index', undefined, { prefixUrl: 'https://other.com' }),
      'https://other.com/users'
    )
  })

  test('per-call options merge with defaultOptions', ({ assert }) => {
    const urlFor = createUrlBuilder(makeRoutes([usersIndex]), stringifier, {
      prefixUrl: 'https://api.example.com',
    })

    assert.equal(
      urlFor('users.index', undefined, { qs: { page: 1 } }),
      'https://api.example.com/users?page=1'
    )
  })

  test('per-call prefixUrl empty string removes default prefix', ({ assert }) => {
    const urlFor = createUrlBuilder(makeRoutes([usersIndex]), stringifier, {
      prefixUrl: 'https://api.example.com',
    })

    assert.equal(urlFor('users.index', undefined, { prefixUrl: '' }), '/users')
  })

  test('defaultOptions qs is applied to all generated URLs', ({ assert }) => {
    const urlFor = createUrlBuilder(makeRoutes([usersIndex]), stringifier, { qs: { version: '2' } })

    assert.equal(urlFor('users.index'), '/users?version=2')
  })

  test('per-call qs overrides defaultOptions qs', ({ assert }) => {
    const urlFor = createUrlBuilder(makeRoutes([usersIndex]), stringifier, { qs: { version: '2' } })

    assert.equal(urlFor('users.index', undefined, { qs: { page: 1 } }), '/users?page=1')
  })
})
