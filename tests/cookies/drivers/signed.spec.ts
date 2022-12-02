/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { EncryptionFactory } from '../../../test_factories/encryption.js'
import { pack, unpack, canUnpack } from '../../../src/cookies/drivers/signed.js'

const encryption = new EncryptionFactory().create()

test.group('Cookie | driver | signed', () => {
  test('sign value', ({ assert }) => {
    const signed = pack('username', 'virk', encryption)

    assert.isNotNull(signed)
    assert.isTrue(signed!.startsWith('s:'))
  })

  test('do not sign null or undefined values', ({ assert }) => {
    assert.isNull(pack('username', null, encryption))
    assert.isNull(pack('username', undefined, encryption))
  })

  test('unsign value', ({ assert }) => {
    const signed = pack('username', 'virk', encryption)
    assert.equal(unpack('username', signed!, encryption), 'virk')
  })

  test('do not unsign invalid string value', ({ assert }) => {
    const value = `s:`
    assert.isTrue(canUnpack(value))
    assert.isNull(unpack('username', value, encryption))
  })
})
