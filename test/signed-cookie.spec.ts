/*
* @poppinss/cookie
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import test from 'japa'
import { base64 } from '@poppinss/utils'
import { Encryption } from '@adonisjs/encryption/build/standalone'
import { pack, unpack, canUnpack } from '../src/Cookie/Drivers/Signed'

const SECRET = 'averylongradom32charactersstring'
const encryption = new Encryption({ secret: SECRET })

test.group('SignedCookie | Pack', () => {
  test('pack cookie as signed cookie', (assert) => {
    const packed = pack('discount', 10, encryption)
    assert.isTrue(packed!.startsWith('s:'))

    const value = packed?.split('.')[0].slice(2)
    assert.equal(base64.urlDecode(value!), '{"message":10,"purpose":"discount"}')
  })
})

test.group('SignedCookie | Unpack', () => {
  test('unpack signed cookie', (assert) => {
    const packed = pack('discount', 10, encryption)
    assert.equal(unpack('discount', packed!, encryption), 10)
  })

  test('return null when key is different', (assert) => {
    const packed = pack('discount', 10, encryption)
    assert.isNull(unpack('tax', packed!, encryption))
  })

  test('return false when signed value is not a string', (assert) => {
    assert.isFalse(canUnpack(10 as any))
  })

  test('return null when signed value doesn\'t start with s:', (assert) => {
    assert.isFalse(canUnpack('10'))
  })

  test('return null when signed value is invalid', (assert) => {
    assert.isNull(unpack('tax', 's:10', encryption))
  })

  test('return null when signed value is empty after e:', (assert) => {
    assert.isNull(unpack('tax', 's:', encryption))
  })
})
