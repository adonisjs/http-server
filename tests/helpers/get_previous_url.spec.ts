/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Socket } from 'node:net'
import { test } from '@japa/runner'
import { IncomingMessage } from 'node:http'

import { getPreviousUrl } from '../../src/helpers.ts'
import { HttpRequestFactory } from '../../factories/request.ts'

test.group('getPreviousUrl', () => {
  test('return fallback when no referer header is set', ({ assert }) => {
    const req = new IncomingMessage(new Socket())
    req.headers = {}
    const request = new HttpRequestFactory().merge({ req }).create()
    assert.equal(getPreviousUrl(request, [], '/fallback'), '/fallback')
  })

  test('return fallback when referer header is empty', ({ assert }) => {
    const req = new IncomingMessage(new Socket())
    req.headers = { referer: '' }
    const request = new HttpRequestFactory().merge({ req }).create()
    assert.equal(getPreviousUrl(request, [], '/'), '/')
  })

  test('accept referer matching the host header', ({ assert }) => {
    const req = new IncomingMessage(new Socket())
    req.headers = { referer: 'https://example.com/foo', host: 'example.com' }
    const request = new HttpRequestFactory().merge({ req }).create()
    assert.equal(getPreviousUrl(request, [], '/'), 'https://example.com/foo')
  })

  test('accept referer matching an allowed host', ({ assert }) => {
    const req = new IncomingMessage(new Socket())
    req.headers = { referer: 'https://admin.example.com/bar', host: 'example.com' }
    const request = new HttpRequestFactory().merge({ req }).create()
    assert.equal(
      getPreviousUrl(request, ['admin.example.com'], '/'),
      'https://admin.example.com/bar'
    )
  })

  test('return fallback when referer host does not match', ({ assert }) => {
    const req = new IncomingMessage(new Socket())
    req.headers = { referer: 'https://evil.com/phish', host: 'example.com' }
    const request = new HttpRequestFactory().merge({ req }).create()
    assert.equal(getPreviousUrl(request, [], '/'), '/')
  })

  test('return fallback for malformed referer', ({ assert }) => {
    const req = new IncomingMessage(new Socket())
    req.headers = { referer: '//evil.com', host: 'example.com' }
    const request = new HttpRequestFactory().merge({ req }).create()
    assert.equal(getPreviousUrl(request, [], '/'), '/')
  })

  test('accept relative referer URLs', ({ assert }) => {
    const req = new IncomingMessage(new Socket())
    req.headers = { referer: '/foo/bar', host: 'example.com' }
    const request = new HttpRequestFactory().merge({ req }).create()
    assert.equal(getPreviousUrl(request, [], '/'), '/foo/bar')
  })

  test('accept referer matching the :authority pseudo header on HTTP/2', ({ assert }) => {
    const req = new IncomingMessage(new Socket())
    req.headers = { 'referer': 'https://example.com/foo', ':authority': 'example.com' }
    const request = new HttpRequestFactory().merge({ req }).create()
    assert.equal(getPreviousUrl(request, [], '/'), 'https://example.com/foo')
  })

  test('prefer :authority over host when both are present', ({ assert }) => {
    const req = new IncomingMessage(new Socket())
    req.headers = {
      'referer': 'https://example.com/foo',
      ':authority': 'example.com',
      'host': 'other.com',
    }
    const request = new HttpRequestFactory().merge({ req }).create()
    assert.equal(getPreviousUrl(request, [], '/'), 'https://example.com/foo')
  })
})
