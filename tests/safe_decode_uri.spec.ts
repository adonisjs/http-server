/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { safeDecodeURI } from '../src/utils.ts'
import { QsParserFactory } from '../factories/qs_parser_factory.ts'

test.group('Safe decode URI', () => {
  test('decode URI', ({ assert }) => {
    assert.deepEqual(safeDecodeURI('/a/b', false), {
      pathname: '/a/b',
      query: '',
      shouldDecodeParam: false,
    })
  })

  test('decode URI with query string', ({ assert }) => {
    assert.deepEqual(safeDecodeURI('/a/b?a=b&c[0]=1', false), {
      pathname: '/a/b',
      query: 'a=b&c[0]=1',
      shouldDecodeParam: false,
    })
  })

  test('decode URI with unicode values', ({ assert }) => {
    assert.deepEqual(safeDecodeURI('/a/b/fran%C3%A7ais?a=b&c[0]=1&foo=fran%C3%A7ais', false), {
      pathname: '/a/b/français',
      query: 'a=b&c[0]=1&foo=fran%C3%A7ais',
      shouldDecodeParam: false,
    })
  })

  test('should instruct to decode params when it contains a %2', ({ assert }) => {
    assert.deepEqual(safeDecodeURI('/a/b/he%2Fllo?a=b&c[0]=1', false), {
      pathname: '/a/b/he%2Fllo',
      query: 'a=b&c[0]=1',
      shouldDecodeParam: true,
    })
  })

  test('throw URIError on malformed UTF-8 sequences', ({ assert }) => {
    assert.throws(() => safeDecodeURI('/%C0%80', false), 'URI malformed')
  })

  test('decode URI and parse query string params', ({ assert }) => {
    const { pathname, query } = safeDecodeURI(
      '/a/b/fran%C3%A7ais?a=b&c[0]=1&foo=fran%C3%A7ais',
      false
    )
    const qs = new QsParserFactory().create().parse(query)

    assert.deepEqual(pathname, '/a/b/français')
    assert.deepEqual(qs, {
      a: 'b',
      c: ['1'],
      foo: 'français',
    })
  })
})
