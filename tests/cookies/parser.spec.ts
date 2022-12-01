/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'

import { CookieParser } from '../../src/cookies/parser.js'
import { CookieSerializer } from '../../src/cookies/serializer.js'
import { EncryptionFactory } from '../../test_factories/encryption.js'

const encryption = new EncryptionFactory().create()
const serializer = new CookieSerializer(encryption)

test.group('Cookie | parse', () => {
  test('get signed cookies', ({ assert }) => {
    const serialized = serializer.sign('username', 'virk')!
    const parser = new CookieParser(serialized, encryption)

    assert.equal(parser.unsign('username'), 'virk')
    assert.isNull(parser.decrypt('username'))
    assert.isNull(parser.decode('username'))
    assert.deepEqual(parser.list(), {
      username: decodeURIComponent(serialized.replace('username=', '')),
    })
  })

  test('get signed cookies from the cache', ({ assert }) => {
    const serialized = serializer.sign('username', 'virk')!
    const parser = new CookieParser(serialized, encryption)

    assert.equal(parser.unsign('username'), 'virk')

    const [, value] = serialized.split('=')
    serialized.replace(value, 'hello world')

    /**
     * Read from cache even though we have updated the original value
     */
    assert.equal(parser.unsign('username'), 'virk')
  })

  test('get encrypted cookies', ({ assert }) => {
    const serialized = serializer.encrypt('username', 'virk')!
    const parser = new CookieParser(serialized, encryption)

    assert.equal(parser.decrypt('username'), 'virk')
    assert.isNull(parser.unsign('username'))
    assert.isNull(parser.decode('username'))

    assert.deepEqual(parser.list(), {
      username: decodeURIComponent(serialized.replace('username=', '')),
    })
  })

  test('get encrypted cookies from the cache', ({ assert }) => {
    const serialized = serializer.encrypt('username', 'virk')!
    const parser = new CookieParser(serialized, encryption)

    assert.equal(parser.decrypt('username'), 'virk')

    const [, value] = serialized.split('=')
    serialized.replace(value, 'hello world')

    /**
     * Read from cache even though we have updated the original value
     */
    assert.equal(parser.decrypt('username'), 'virk')
  })

  test('get plain cookies', ({ assert }) => {
    const serialized = serializer.encode('username', 'virk')!
    const parser = new CookieParser(serialized, encryption)

    assert.isNull(parser.decrypt('username'))
    assert.isNull(parser.unsign('username'))
    assert.equal(parser.decode('username'), 'virk')

    assert.deepEqual(parser.list(), {
      username: decodeURIComponent(serialized.replace('username=', '')),
    })
  })

  test('get plain cookies from the cache', ({ assert }) => {
    const serialized = serializer.encode('username', 'virk')!
    const parser = new CookieParser(serialized, encryption)

    assert.equal(parser.decode('username'), 'virk')

    const [, value] = serialized.split('=')
    serialized.replace(value, 'hello world')

    /**
     * Read from cache even though we have updated the original value
     */
    assert.equal(parser.decode('username'), 'virk')
  })

  test('get unencoded plain cookies', ({ assert }) => {
    const serialized = serializer.encode('username', 'virk', { encode: false })!
    const parser = new CookieParser(serialized, encryption)

    assert.isNull(parser.decrypt('username'))
    assert.isNull(parser.unsign('username'))
    assert.equal(parser.decode('username', false), 'virk')

    assert.deepEqual(parser.list(), {
      username: decodeURIComponent(serialized.replace('username=', '')),
    })
  })
})

test.group('Cookie | parse | tampering', () => {
  test('detect tampered encrypted cookie', ({ assert }) => {
    const serialized = serializer.encode('username', 'virk')!
    const [key, value] = serialized.split('=')
    const forged = `${key}=e%${value}`

    const parser = new CookieParser(forged, encryption)
    assert.isNull(parser.decrypt('username'))
    assert.isNull(parser.unsign('username'))
    assert.isNull(parser.decode('username'))
    assert.deepEqual(Object.keys(parser.list()), ['username'])
  })

  test('detect tampered signed cookie', ({ assert }) => {
    const serialized = serializer.encode('username', 'virk')!
    const [key, value] = serialized.split('=')
    const forged = `${key}=s%${value}`

    const parser = new CookieParser(forged, encryption)
    assert.isNull(parser.decrypt('username'))
    assert.isNull(parser.unsign('username'))
    assert.isNull(parser.decode('username'))
    assert.deepEqual(Object.keys(parser.list()), ['username'])
  })

  test('detect when signed cookies is tampered as plain cookie', ({ assert }) => {
    const serialized = serializer.sign('username', 'virk')!
    const [key, value] = serialized.split('=')
    const forged = `${key}=${value.slice(2)}`

    const parser = new CookieParser(forged, encryption)
    assert.isNull(parser.decrypt('username'))
    assert.isNull(parser.unsign('username'))
    assert.isNull(parser.decode('username'))
    assert.deepEqual(Object.keys(parser.list()), ['username'])
  })

  test('detect when encrypted cookies is tampered as plain cookie', ({ assert }) => {
    const serialized = serializer.encrypt('username', 'virk')!
    const [key, value] = serialized.split('=')
    const forged = `${key}=${value.slice(2)}`

    const parser = new CookieParser(forged, encryption)
    assert.isNull(parser.decrypt('username'))
    assert.isNull(parser.unsign('username'))
    assert.isNull(parser.decode('username'))
    assert.deepEqual(Object.keys(parser.list()), ['username'])
  })
})

test.group('Cookie | parse | swap', () => {
  test('detect encrypted cookies swap', ({ assert }) => {
    const [, age] = serializer.encrypt('age', 22)!.split('=')
    const forged = new CookieParser(`username=${age}`, encryption)
    const original = new CookieParser(`age=${age}`, encryption)

    assert.isNull(forged.decrypt('username'))
    assert.isNull(forged.unsign('username'))
    assert.isNull(forged.decode('username'))
    assert.deepEqual(Object.keys(forged.list()), ['username'])

    assert.equal(original.decrypt('age'), 22)
    assert.isNull(original.unsign('age'))
    assert.isNull(original.decode('age'))
    assert.deepEqual(Object.keys(original.list()), ['age'])
  })

  test('detect signed cookies swap', ({ assert }) => {
    const age = serializer.sign('age', 22)!.split('=')[1]
    const forged = new CookieParser(`username=${age}`, encryption)
    const original = new CookieParser(`age=${age}`, encryption)

    assert.isNull(forged.decrypt('username'))
    assert.isNull(forged.unsign('username'))
    assert.isNull(forged.decode('username'))
    assert.deepEqual(Object.keys(forged.list()), ['username'])

    assert.equal(original.unsign('age'), 22)
    assert.isNull(original.decrypt('age'))
    assert.isNull(original.decode('age'))
    assert.deepEqual(Object.keys(original.list()), ['age'])
  })
})
