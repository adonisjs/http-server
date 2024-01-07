/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { randomUUID } from 'node:crypto'
import { RouteMatchers } from '../../src/router/matchers.js'

test.group('Matchers', () => {
  test('get matcher for a number', ({ assert }) => {
    const number = new RouteMatchers().number()

    assert.isTrue(number.match.test('1'))
    assert.isFalse(number.match.test('120.22'))
    assert.isFalse(number.match.test('hello'))

    assert.equal(number.cast('1'), 1)
  })

  test('get matcher for a uuid', ({ assert }) => {
    const uuid = new RouteMatchers().uuid()

    assert.isTrue(uuid.match.test(randomUUID()))
    assert.isTrue(uuid.match.test(randomUUID().toUpperCase()))
    assert.isTrue(uuid.match.test(randomUUID().toLowerCase()))
    assert.isFalse(uuid.match.test('hello-world'))

    const value = randomUUID()
    assert.equal(uuid.cast(value.toUpperCase()), value)
  })

  test('get matcher for a slug', ({ assert }) => {
    const slug = new RouteMatchers().slug()

    assert.isTrue(slug.match.test('hello_world'))
    assert.isTrue(slug.match.test('hello-world'))
    assert.isFalse(slug.match.test('hello world'))
    assert.isFalse(slug.match.test('1'))
  })
})
