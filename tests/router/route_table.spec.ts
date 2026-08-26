/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'

import { parseRoute } from '../../src/helpers.ts'
import { RouteTable } from '../../src/router/route_table.ts'

test.group('Route table', () => {
  test('return the first registered matching route regardless of its shape', ({ assert }) => {
    const table = new RouteTable<{ pattern: string }>()
    const dynamicRoute = { pattern: '/:value' }
    const staticRoute = { pattern: '/users' }

    table.add(parseRoute(dynamicRoute.pattern), dynamicRoute)
    table.add(parseRoute(staticRoute.pattern), staticRoute)

    const match = table.match('/users', false)
    assert.strictEqual(match?.value, dynamicRoute)
    assert.deepEqual(match, {
      value: dynamicRoute,
      params: { value: 'users' },
    })
  })

  test('match and decode wildcard parameters', ({ assert }) => {
    const table = new RouteTable<{ pattern: string }>()
    const route = { pattern: '/files/*' }

    table.add(parseRoute(route.pattern), route)

    assert.deepEqual(table.match('/files/folder%20one/file%20two', true), {
      value: route,
      params: { '*': ['folder one', 'file two'] },
    })
  })

  test('match optional parameters with and without a value', ({ assert }) => {
    const table = new RouteTable<{ pattern: string }>()
    const route = { pattern: '/archive/:year?' }

    table.add(parseRoute(route.pattern), route)

    assert.deepEqual(table.match('/archive', false), { value: route, params: {} })
    assert.deepEqual(table.match('/archive/2026', false), {
      value: route,
      params: { year: '2026' },
    })

    const rootTable = new RouteTable<{ pattern: string }>()
    const rootRoute = { pattern: '/:value?' }
    rootTable.add(parseRoute(rootRoute.pattern), rootRoute)
    assert.deepEqual(rootTable.match('/', false), { value: rootRoute, params: {} })
  })

  test('preserve stateful matcher evaluation order', ({ assert }) => {
    const table = new RouteTable<{ pattern: string }>()
    const matcher = /^[a-z]+$/g
    const dynamicRoute = { pattern: '/:value/foo' }
    const staticRoute = { pattern: '/users/bar' }

    table.add(parseRoute(dynamicRoute.pattern, { value: { match: matcher } }), dynamicRoute)
    table.add(parseRoute(staticRoute.pattern), staticRoute)

    assert.deepEqual(table.match('/users/bar', false), { value: staticRoute, params: {} })
    assert.isNull(table.match('/abc/foo', false))
  })

  test('preserve missing parameter semantics before a trailing optional', ({ assert }) => {
    const table = new RouteTable<{ pattern: string }>()
    const route = { pattern: '/archive/:year/:month?' }

    table.add(parseRoute(route.pattern), route)

    assert.deepEqual(table.match('/archive', false), { value: route, params: {} })
  })

  test('preserve parameter extraction for non-canonical wildcard patterns', ({ assert }) => {
    const table = new RouteTable<{ pattern: string }>()
    const route = { pattern: '/*/:id/*' }

    table.add(parseRoute(route.pattern), route)

    assert.deepEqual(table.match('////a////', false), {
      value: route,
      params: {
        '*/:id/*': '',
        'id': '',
        '*': ['a', '', '', ''],
      },
    })
  })

  test('preserve empty path matches with a wildcard before a trailing optional', ({ assert }) => {
    const table = new RouteTable<{ pattern: string }>()
    const route = { pattern: '/:value/*:optional?' }

    table.add(parseRoute(route.pattern), route)

    assert.deepEqual(table.match('', false), {
      value: route,
      params: { value: '' },
    })
  })

  test('preserve custom regular expression evaluation order', ({ assert }) => {
    const table = new RouteTable<{ pattern: string }>()
    const matcher = /^[a-z]+$/
    let matcherCalls = 0
    matcher.exec = function exec(value: string) {
      matcherCalls++
      return RegExp.prototype.exec.call(this, value)
    }

    const dynamicRoute = { pattern: '/:value/foo' }
    const staticRoute = { pattern: '/users/bar' }
    table.add(parseRoute(dynamicRoute.pattern, { value: { match: matcher } }), dynamicRoute)
    table.add(parseRoute(staticRoute.pattern), staticRoute)

    assert.deepEqual(table.match('/users/bar', false), { value: staticRoute, params: {} })
    assert.equal(matcherCalls, 1)
  })

  test('evaluate every matcher on a structurally matched route', ({ assert }) => {
    const table = new RouteTable<{ pattern: string }>()
    const constrainedRoute = { pattern: '/:section/:id?' }
    const fallbackRoute = { pattern: '/:type/:value' }

    table.add(
      parseRoute(constrainedRoute.pattern, {
        section: { match: /^users$/ },
        id: { match: /^\d+$/ },
      }),
      constrainedRoute
    )
    table.add(parseRoute(fallbackRoute.pattern), fallbackRoute)

    assert.deepEqual(table.match('/users/42', false), {
      value: constrainedRoute,
      params: { section: 'users', id: '42' },
    })
    assert.deepEqual(table.match('/users', false), {
      value: constrainedRoute,
      params: { section: 'users' },
    })
    assert.deepEqual(table.match('/users/not-a-number', false), {
      value: fallbackRoute,
      params: { type: 'users', value: 'not-a-number' },
    })
  })
})
