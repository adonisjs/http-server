/**
 * @adonisjs/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'
import { base64 } from '@poppinss/utils'

import { pack, unpack, canUnpack } from '../src/Cookie/Drivers/Plain'
import { pack as encryptedPack } from '../src/Cookie/Drivers/Encrypted'

import { encryption } from '../test-helpers'

test.group('PlainCookie | Pack', () => {
	test('pack cookie as base64', (assert) => {
		const packed = pack(10)
		assert.equal(base64.urlDecode(packed!), '{"message":10}')
	})
})

test.group('PlainCookie | Unpack', () => {
	test('unpack cookie', (assert) => {
		const packed = pack(10)
		assert.equal(unpack(packed!), 10)
	})

	test('return false when value is not a string', (assert) => {
		assert.isFalse(canUnpack(10 as any))
	})

	test('return null when not base64 url encoded', (assert) => {
		assert.isNull(unpack('10'))
	})

	test('return null when value is invalid', (assert) => {
		assert.isNull(unpack(base64.urlEncode('10')))
	})

	test('return null when passing encrypted cookie to plain cookie unpack', (assert) => {
		assert.isNull(unpack(encryptedPack('discount', 10, encryption)!.slice(2)))
	})
})
