/**
 * @adonisjs/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { base64, MessageBuilder } from '@poppinss/utils/build/helpers'

import { encryption } from '../test-helpers'
import { CookieSerializer } from '../src/Cookie/Serializer'

test.group('Cookie | serialize', () => {
  test('serialize and sign cookie', ({ assert }) => {
    const serializer = new CookieSerializer(encryption)
    const serialized = serializer.sign('username', 'virk')

    assert.isNotNull(serialized)
    assert.match(serialized!, /username=s%/)
  })

  test('serialize and encrypt cookie', ({ assert }) => {
    const serializer = new CookieSerializer(encryption)
    const serialized = serializer.encrypt('username', 'virk')

    assert.isNotNull(serialized)
    assert.match(serialized!, /username=e%/)
  })

  test('serialize and base64 encode cookie', ({ assert }) => {
    const serializer = new CookieSerializer(encryption)
    const serialized = serializer.encode('username', 'virk')

    assert.isNotNull(serialized)
    assert.equal(base64.urlDecode(serialized!.split('=')[1]), '{"message":"virk"}')
  })

  test(`serialize and don't encode cookie`, ({ assert }) => {
    const serializer = new CookieSerializer(encryption)
    const serialized = serializer.encode('username', 'virk', { encode: false })

    assert.isNotNull(serialized)
    assert.equal(serialized!.split('=')[0], 'username')
    assert.equal(serialized!.split('=')[1], 'virk')
  })

  test('set cookie domain', ({ assert }) => {
    const serializer = new CookieSerializer(encryption)
    const serialized = serializer.encode('username', 'virk', { domain: 'adonisjs.com' })

    const expectedValue = base64.urlEncode(new MessageBuilder().build('virk'))
    assert.equal(serialized, `username=${expectedValue}; Domain=adonisjs.com`)
  })

  test('set httponly flag', ({ assert }) => {
    const serializer = new CookieSerializer(encryption)
    const serialized = serializer.encode('username', 'virk', { httpOnly: true })

    const expectedValue = base64.urlEncode(new MessageBuilder().build('virk'))
    assert.equal(serialized, `username=${expectedValue}; HttpOnly`)
  })

  test('invoke expires callback when defined as a function', ({ assert }, done) => {
    const config = { expires: () => new Date() }
    const serializer = new CookieSerializer(encryption)
    const serialized = serializer.encode('username', 'virk', config)

    setTimeout(() => {
      const serialized1 = serializer.encode('username', 'virk', config)
      assert.notEqual(serialized, serialized1)
      done()
    }, 1000 * 2)
  })
    .timeout(1000 * 4)
    .waitForDone()

  test('do not set expires when it is explicit undefined', ({ assert }) => {
    const config = { expires: undefined }
    const serializer = new CookieSerializer(encryption)
    const serialized = serializer.encode('username', 'virk', config)

    const expectedValue = base64.urlEncode(new MessageBuilder().build('virk'))
    assert.equal(serialized, `username=${expectedValue}`)
  })

  test('do not set max age when it is explicit undefined', ({ assert }) => {
    const config = { maxAge: undefined }
    const serializer = new CookieSerializer(encryption)
    const serialized = serializer.encode('username', 'virk', config)

    const expectedValue = base64.urlEncode(new MessageBuilder().build('virk'))
    assert.equal(serialized, `username=${expectedValue}`)
  })
})
