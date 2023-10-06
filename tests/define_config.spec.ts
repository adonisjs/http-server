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

test.group('Define config', () => {
  test('define server config', ({ assert }) => {
    assert.containsSubset(defineConfig({}), {
      allowMethodSpoofing: false,
      etag: false,
      cookie: {
        httpOnly: true,
        path: '/',
        maxAge: 7200,
        sameSite: false,
        secure: false,
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
        sameSite: false,
        secure: false,
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
})
