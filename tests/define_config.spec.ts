/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import proxyAddr from 'proxy-addr'
import { test } from '@japa/runner'
import { defineConfig } from '../index.ts'

test.group('Define config', () => {
  test('define server config', ({ assert }) => {
    assert.containsSubset(defineConfig({}), {
      allowMethodSpoofing: false,
      etag: false,
      cookie: {
        httpOnly: true,
        path: '/',
        maxAge: 7200,
        sameSite: 'lax',
        secure: true,
      },
      generateRequestId: false,
      jsonpCallbackName: 'callback',
      router: {
        matcher: 'linear',
      },
      subdomainOffset: 2,
      useAsyncLocalStorage: false,
    })
  })

  test('give preference to defined config', ({ assert }) => {
    assert.containsSubset(defineConfig({ allowMethodSpoofing: true }), {
      allowMethodSpoofing: true,
      etag: false,
      cookie: {
        httpOnly: true,
        path: '/',
        maxAge: 7200,
        sameSite: 'lax',
        secure: true,
      },
      generateRequestId: false,
      jsonpCallbackName: 'callback',
      router: {
        matcher: 'linear',
      },
      subdomainOffset: 2,
      useAsyncLocalStorage: false,
    })
  })

  test('configure the tree matcher', ({ assert }) => {
    assert.deepEqual(
      defineConfig({ router: { matcher: 'tree', precedence: 'specificity' } }).router,
      { matcher: 'tree', precedence: 'specificity' }
    )
  })

  test('compile trustProxy config when boolean', ({ assert }) => {
    const config = defineConfig({ trustProxy: true })

    assert.typeOf(config.trustProxy, 'function')
  })

  test('compile trustProxy config when string', ({ assert }) => {
    const config = defineConfig({ trustProxy: 'loopback' })

    assert.typeOf(config.trustProxy, 'function')
    assert.isTrue(config.trustProxy('127.0.0.1', 0))
    assert.isFalse(config.trustProxy('10.20.30.40', 0))
  })

  test('compile comma-separated trustProxy config', ({ assert }) => {
    const config = defineConfig({
      trustProxy: 'loopback, 10.20.0.0/16, 2001:db8::/32',
    })

    assert.isTrue(config.trustProxy('127.0.0.1', 0))
    assert.isTrue(config.trustProxy('10.20.30.40', 0))
    assert.isTrue(config.trustProxy('2001:db8::1', 0))
    assert.isFalse(config.trustProxy('192.168.1.1', 0))
  })

  test('compile trustProxy config when an array', ({ assert }) => {
    const config = defineConfig({ trustProxy: ['loopback', '2001:db8::/32'] })

    assert.isTrue(config.trustProxy('127.0.0.1', 0))
    assert.isTrue(config.trustProxy('2001:db8::1', 0))
    assert.isFalse(config.trustProxy('10.20.30.40', 0))
  })

  test('trust no proxies when a comma-separated string has no ranges', ({ assert }) => {
    const config = defineConfig({ trustProxy: ' , ' })

    assert.isFalse(config.trustProxy('127.0.0.1', 0))
  })

  test('throw when a trustProxy range is invalid', ({ assert }) => {
    assert.throws(
      () => defineConfig({ trustProxy: 'loopback, invalid' }),
      'invalid IP address: invalid'
    )
  })

  test('compile trustProxy config when a function', ({ assert }) => {
    const fn = proxyAddr.compile(['192.168.1.2'])
    const config = defineConfig({ trustProxy: fn })
    assert.strictEqual(config.trustProxy, fn)
  })

  test('deep merge user values with defaults', ({ assert }) => {
    const config = defineConfig({
      cookie: {
        httpOnly: false,
      },
      qs: {
        parse: {
          comma: false,
        },
      },
    })

    assert.deepEqual(config.cookie, {
      httpOnly: false,
      path: '/',
      maxAge: 7200,
      sameSite: 'lax',
      secure: true,
    })
    assert.deepEqual(config.qs, {
      parse: {
        depth: 5,
        parameterLimit: 1000,
        allowSparse: false,
        arrayLimit: 20,
        comma: false,
      },
      stringify: {
        encode: true,
        encodeValuesOnly: false,
        arrayFormat: 'indices' as const,
        skipNulls: false,
      },
    })
  })
})
