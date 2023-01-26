/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { base64, MessageBuilder } from '@poppinss/utils'
import { EncryptionFactory } from '@adonisjs/encryption/factories'

import { CookieSerializer } from '../../src/cookies/serializer.js'

const encryption = new EncryptionFactory().create()

test.group('Cookie | serialize', () => {
  test('serialize and sign cookie', ({ assert }) => {
    const serializer = new CookieSerializer(encryption)
    const serialized = serializer.sign('username', 'virk')

    assert.isNotNull(serialized)
    assert.match(serialized!, /username=s%/)
    assert.isNull(serializer.sign('username', null))
    assert.isNull(serializer.sign('username', undefined))
  })

  test('serialize and encrypt cookie', ({ assert }) => {
    const serializer = new CookieSerializer(encryption)
    const serialized = serializer.encrypt('username', 'virk')

    assert.isNotNull(serialized)
    assert.match(serialized!, /username=e%/)

    assert.isNull(serializer.encrypt('username', null))
    assert.isNull(serializer.encrypt('username', undefined))
  })

  test('serialize and base64 encode cookie', ({ assert }) => {
    const serializer = new CookieSerializer(encryption)
    const serialized = serializer.encode('username', 'virk')

    assert.isNotNull(serialized)

    const [key, value] = serialized!.split('=')
    assert.equal(key, 'username')
    assert.equal(base64.urlDecode(value), '{"message":"virk"}')

    assert.isNull(serializer.encode('username', null))
    assert.isNull(serializer.encode('username', undefined))
  })

  test("serialize and don't encode cookie", ({ assert }) => {
    const serializer = new CookieSerializer(encryption)
    const serialized = serializer.encode('username', 'virk', { encode: false })

    assert.isNotNull(serialized)

    const [key, value] = serialized!.split('=')
    assert.equal(key, 'username')
    assert.equal(value, 'virk')

    assert.isNull(serializer.encode('username', null, { encode: false }))
    assert.isNull(serializer.encode('username', undefined, { encode: false }))
  })

  test('set cookie domain', ({ assert }) => {
    const serializer = new CookieSerializer(encryption)
    const serialized = serializer.encode('username', 'virk', { domain: 'adonisjs.com' })

    const [, options] = serialized!.split('; ')
    assert.equal(options, `Domain=adonisjs.com`)
  })

  test('set httponly flag', ({ assert }) => {
    const serializer = new CookieSerializer(encryption)
    const serialized = serializer.encode('username', 'virk', { httpOnly: true })

    const [, options] = serialized!.split('; ')
    assert.equal(options, `HttpOnly`)
  })

  test('invoke expires callback when defined as a function', async ({ assert, sleep }) => {
    const config = { expires: () => new Date() }

    const serializer = new CookieSerializer(encryption)
    const serialized = serializer.encode('username', 'virk', config)

    await sleep(1000)
    const serialized1 = serializer.encode('username', 'virk', config)
    assert.notEqual(serialized, serialized1)
  })

  test('do not set expires when it is set to undefined', ({ assert }) => {
    const config = { expires: undefined }
    const serializer = new CookieSerializer(encryption)
    const serialized = serializer.encode('username', 'virk', config)

    const expectedValue = base64.urlEncode(new MessageBuilder().build('virk'))
    assert.equal(serialized, `username=${expectedValue}`)
  })

  test('do not set max age when it is set to undefined', ({ assert }) => {
    const config = { maxAge: undefined }
    const serializer = new CookieSerializer(encryption)
    const serialized = serializer.encode('username', 'virk', config)

    const expectedValue = base64.urlEncode(new MessageBuilder().build('virk'))
    assert.equal(serialized, `username=${expectedValue}`)
  })

  test('define max age as time expression', ({ assert }) => {
    const config = { maxAge: '1min' }
    const serializer = new CookieSerializer(encryption)
    const serialized = serializer.encode('username', 'virk', config)

    const [, options] = serialized!.split('; ')
    assert.equal(options, `Max-Age=60`)
  })

  test('define max age in seconds', ({ assert }) => {
    const config = { maxAge: 60 }
    const serializer = new CookieSerializer(encryption)
    const serialized = serializer.encode('username', 'virk', config)

    const [, options] = serialized!.split('; ')
    assert.equal(options, `Max-Age=60`)
  })
})
