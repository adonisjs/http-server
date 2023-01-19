/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { parseRange } from '../../src/helpers.js'

test.group('Helpers | parse range', () => {
  test('parse a range expression to an object', ({ assert }) => {
    const result = parseRange('200..209', true)
    assert.deepEqual(result, {
      200: true,
      201: true,
      202: true,
      203: true,
      204: true,
      205: true,
      206: true,
      207: true,
      208: true,
      209: true,
    })
  })

  test('parse when both the numbers of the range are same', ({ assert }) => {
    const result = parseRange('200..200', true)
    assert.deepEqual(result, {
      200: true,
    })
  })

  test('raise error when end value is smaller than starting value', ({ assert }) => {
    assert.throws(() => parseRange('210..200', true), 'Invalid range "210..200"')
  })

  test('return empty object when range has non-numeric values', ({ assert }) => {
    const result = parseRange('a..c', true)
    assert.deepEqual(result, {})
  })
})
