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
import { EncryptionFactory } from '@adonisjs/encryption/factories'
import { pack, unpack, canUnpack } from '../../../src/cookies/drivers/encrypted.js'

const encryption = new EncryptionFactory().create()

test.group('Cookie | driver | encrypted', () => {
  test('encrypt value', ({ assert }) => {
    const encrypted = pack('username', 'virk', encryption)

    assert.isNotNull(encrypted)
    assert.isTrue(encrypted!.startsWith('e:'))
  })

  test('do not encrypt null or undefined values', ({ assert }) => {
    assert.isNull(pack('username', null, encryption))
    assert.isNull(pack('username', undefined, encryption))
  })

  test('decrypt value', ({ assert }) => {
    const encrypted = pack('username', 'virk', encryption)
    assert.equal(unpack('username', encrypted!, encryption), 'virk')
  })

  test('do not decrypt invalid string value', ({ assert }) => {
    const value = `e:`
    assert.isTrue(canUnpack(value))
    assert.isNull(unpack('username', value, encryption))
  })
})
