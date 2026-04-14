/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { isValidRedirectUrl } from '../../src/helpers.js'

test.group('isValidRedirectUrl', () => {
  test('accept relative URLs starting with /', ({ assert }) => {
    assert.isTrue(isValidRedirectUrl('/'))
    assert.isTrue(isValidRedirectUrl('/foo'))
    assert.isTrue(isValidRedirectUrl('/foo/bar'))
    assert.isTrue(isValidRedirectUrl('/foo?bar=baz'))
    assert.isTrue(isValidRedirectUrl('/foo#section'))
  })

  test('reject empty or non-string values', ({ assert }) => {
    assert.isFalse(isValidRedirectUrl(''))
    assert.isFalse(isValidRedirectUrl('   '))
    assert.isFalse(isValidRedirectUrl(null as any))
    assert.isFalse(isValidRedirectUrl(undefined as any))
    assert.isFalse(isValidRedirectUrl(123 as any))
  })

  test('reject protocol-relative URLs', ({ assert }) => {
    assert.isFalse(isValidRedirectUrl('//evil.com'))
    assert.isFalse(isValidRedirectUrl('//evil.com/path'))
  })

  test('reject relative URLs that trick the URL parser', ({ assert }) => {
    assert.isFalse(isValidRedirectUrl('/\\evil.com'))
  })

  test('accept absolute URLs when no host constraints are provided', ({ assert }) => {
    assert.isTrue(isValidRedirectUrl('https://example.com'))
    assert.isTrue(isValidRedirectUrl('https://example.com/path'))
    assert.isTrue(isValidRedirectUrl('http://localhost:3000/foo'))
  })

  test('reject malformed absolute URLs', ({ assert }) => {
    assert.isFalse(isValidRedirectUrl('not-a-url'))
    assert.isFalse(isValidRedirectUrl('ftp://'))
  })

  test('accept absolute URLs matching currentHost', ({ assert }) => {
    assert.isTrue(isValidRedirectUrl('https://example.com/foo', 'example.com'))
    assert.isTrue(isValidRedirectUrl('http://localhost:3000/foo', 'localhost:3000'))
  })

  test('reject absolute URLs not matching currentHost', ({ assert }) => {
    assert.isFalse(isValidRedirectUrl('https://evil.com/foo', 'example.com'))
    assert.isFalse(isValidRedirectUrl('https://example.com:8080/foo', 'example.com'))
  })

  test('accept absolute URLs in allowedHosts', ({ assert }) => {
    assert.isTrue(isValidRedirectUrl('https://app.example.com/foo', undefined, ['app.example.com']))
    assert.isTrue(
      isValidRedirectUrl('https://admin.example.com/foo', 'app.example.com', ['admin.example.com'])
    )
  })

  test('reject absolute URLs not in allowedHosts or currentHost', ({ assert }) => {
    assert.isFalse(isValidRedirectUrl('https://evil.com/foo', 'example.com', ['app.example.com']))
  })

  test('relative URLs ignore host constraints', ({ assert }) => {
    assert.isTrue(isValidRedirectUrl('/foo', 'example.com', ['app.example.com']))
  })
})
