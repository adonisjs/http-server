/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { defineConfig } from '../index.js'
import proxyAddr from 'proxy-addr'

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
      subdomainOffset: 2,
      useAsyncLocalStorage: false,
    })
  })

  test('compile trustProxy config when boolean', ({ assert }) => {
    const config = defineConfig({ trustProxy: true })

    assert.typeOf(config.trustProxy, 'function')
  })

  test('comfile trustProxy config when string', ({ assert }) => {
    const config = defineConfig({ trustProxy: 'loopback' })

    assert.typeOf(config.trustProxy, 'function')
  })

  test('compile trustProxy config when a function', ({ assert }) => {
    const fn = proxyAddr.compile(['192.168.1.2'])
    const config = defineConfig({ trustProxy: fn })
    assert.strictEqual(config.trustProxy, fn)
  })
})
