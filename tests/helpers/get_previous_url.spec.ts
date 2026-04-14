/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { getPreviousUrl } from '../../src/helpers.js'

test.group('getPreviousUrl', () => {
  test('return fallback when no referer header is set', ({ assert }) => {
    assert.equal(getPreviousUrl({}, [], '/fallback'), '/fallback')
  })

  test('return fallback when referer header is empty', ({ assert }) => {
    assert.equal(getPreviousUrl({ referer: '' }, [], '/'), '/')
  })

  test('accept referer matching the host header', ({ assert }) => {
    const headers = { referer: 'https://example.com/foo', host: 'example.com' }
    assert.equal(getPreviousUrl(headers, [], '/'), 'https://example.com/foo')
  })

  test('accept referer matching an allowed host', ({ assert }) => {
    const headers = { referer: 'https://admin.example.com/bar', host: 'example.com' }
    assert.equal(
      getPreviousUrl(headers, ['admin.example.com'], '/'),
      'https://admin.example.com/bar'
    )
  })

  test('return fallback when referer host does not match', ({ assert }) => {
    const headers = { referer: 'https://evil.com/phish', host: 'example.com' }
    assert.equal(getPreviousUrl(headers, [], '/'), '/')
  })

  test('return fallback for malformed referer', ({ assert }) => {
    const headers = { referer: '//evil.com', host: 'example.com' }
    assert.equal(getPreviousUrl(headers, [], '/'), '/')
  })

  test('accept relative referer URLs', ({ assert }) => {
    const headers = { referer: '/foo/bar', host: 'example.com' }
    assert.equal(getPreviousUrl(headers, [], '/'), '/foo/bar')
  })

  test('use the first value when referer is an array', ({ assert }) => {
    const headers = {
      referer: ['https://example.com/a', 'https://example.com/b'] as any,
      host: 'example.com',
    }
    assert.equal(getPreviousUrl(headers, [], '/'), 'https://example.com/a')
  })

  test('use referrer header when referer is not set', ({ assert }) => {
    const headers = { referrer: 'https://example.com/foo', host: 'example.com' } as any
    assert.equal(getPreviousUrl(headers, [], '/'), 'https://example.com/foo')
  })
})
