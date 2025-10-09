/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { appendQueryString } from '../../src/helpers.ts'
import { QsParserFactory } from '../../factories/qs_parser_factory.ts'

test.group('Append query string', () => {
  test('return pathname as it is when there is no query string to append', ({ assert }) => {
    const qsParser = new QsParserFactory().create()
    assert.equal(appendQueryString('/users', {}, qsParser), '/users')
  })

  test('append query string to the pathname', ({ assert }) => {
    const qsParser = new QsParserFactory().create()
    assert.equal(appendQueryString('/users', { page: 1 }, qsParser), '/users?page=1')
  })

  test('append query string to the pathname with existing query string', ({ assert }) => {
    const qsParser = new QsParserFactory().merge({ stringify: { encode: false } }).create()
    assert.equal(
      appendQueryString('/a/b/he%2Fllo?a=b&c[0]=1', { page: 1 }, qsParser),
      '/a/b/he%2Fllo?a=b&c[0]=1&page=1'
    )
  })
})
