/*
* @poppinss/cookie
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import test from 'japa'
import { Encryption } from '@adonisjs/encryption/build/standalone'
import { pack, unpack, canUnpack } from '../src/Cookie/Drivers/Encrypted'

const SECRET = 'averylongradom32charactersstring'
const encryption = new Encryption({ secret: SECRET })

test.group('EncryptedCookie | Pack', () => {
  test('pack cookie as encrypted cookie', (assert) => {
    const packed = pack('discount', 10, encryption)
    assert.isTrue(packed!.startsWith('e:'))
  })
})

test.group('EncryptedCookie | Unpack', () => {
  test('unpack encrypted cookie', (assert) => {
    const packed = pack('discount', 10, encryption)
    assert.equal(unpack('discount', packed!, encryption), 10)
  })

  test('return null when key is different', (assert) => {
    const packed = pack('discount', 10, encryption)
    assert.isNull(unpack('tax', packed!, encryption))
  })

  test('return false when encrypted value is not a string', (assert) => {
    assert.isFalse(canUnpack(10 as any))
  })

  test('return null when encrypted value doesn\'t start with s:', (assert) => {
    assert.isFalse(canUnpack('10'))
  })

  test('return null when encrypted value is invalid', (assert) => {
    assert.isNull(unpack('tax', 'e:10', encryption))
  })

  test('return null when encrypted value is empty after e:', (assert) => {
    assert.isNull(unpack('tax', 'e:', encryption))
  })
})
