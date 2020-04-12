/*
* @adonisjs/cookie
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import test from 'japa'
import { Encryption } from '@adonisjs/encryption/build/standalone'

import { CookieParser } from '../src/Cookie/Parser'
import { CookieSerializer } from '../src/Cookie/Serializer'

const SECRET = Math.random().toFixed(36).substring(2, 38)
const encryption = new Encryption({ secret: SECRET })
const serializer = new CookieSerializer(encryption)

test.group('Cookie | parse', () => {
  test('get signed cookies', (assert) => {
    const serialized = serializer.sign('username', 'virk')!
    const parser = new CookieParser(serialized, encryption)

    assert.equal(parser.unsign('username'), 'virk')
    assert.isNull(parser.decrypt('username'))
    assert.isNull(parser.decode('username'))
    assert.deepEqual(Object.keys(parser.list()), ['username'])
  })

  test('parse encrypted cookies', (assert) => {
    const serialized = serializer.encrypt('username', 'virk')!
    const parser = new CookieParser(serialized, encryption)

    assert.equal(parser.decrypt('username'), 'virk')
    assert.isNull(parser.unsign('username'))
    assert.isNull(parser.decode('username'))
    assert.deepEqual(Object.keys(parser.list()), ['username'])
  })

  test('parse plain cookies', (assert) => {
    const serialized = serializer.encode('username', 'virk')!
    const parser = new CookieParser(serialized, encryption)

    assert.isNull(parser.decrypt('username'))
    assert.isNull(parser.unsign('username'))
    assert.equal(parser.decode('username'), 'virk')
    assert.deepEqual(Object.keys(parser.list()), ['username'])
  })

  test('handle case in which plain cookie is tricked into encrypted cookie', (assert) => {
    const serialized = serializer.encode('username', 'virk')!
    const [key, value] = serialized.split('=')
    const forged = `${key}=e%${value}`

    const parser = new CookieParser(forged, encryption)
    assert.isNull(parser.decrypt('username'))
    assert.isNull(parser.unsign('username'))
    assert.isNull(parser.decode('username'))
    assert.deepEqual(Object.keys(parser.list()), ['username'])
  })

  test('handle case in which plain cookie is tricked into signed cookie', (assert) => {
    const serialized = serializer.encode('username', 'virk')!
    const [key, value] = serialized.split('=')
    const forged = `${key}=s%${value}`

    const parser = new CookieParser(forged, encryption)
    assert.isNull(parser.decrypt('username'))
    assert.isNull(parser.unsign('username'))
    assert.isNull(parser.decode('username'))
    assert.deepEqual(Object.keys(parser.list()), ['username'])
  })

  test('handle case in which signed cookie is tricked into plain cookie', (assert) => {
    const serialized = serializer.sign('username', 'virk')!
    const [key, value] = serialized.split('=')
    const forged = `${key}=${value.slice(2)}`

    const parser = new CookieParser(forged, encryption)
    assert.isNull(parser.decrypt('username'))
    assert.isNull(parser.unsign('username'))
    assert.isNull(parser.decode('username'))
    assert.deepEqual(Object.keys(parser.list()), ['username'])
  })

  test('handle case in which encrypted cookie is tricked into plain cookie', (assert) => {
    const serialized = serializer.encrypt('username', 'virk')!
    const [key, value] = serialized.split('=')
    const forged = `${key}=${value.slice(2)}`

    const parser = new CookieParser(forged, encryption)
    assert.isNull(parser.decrypt('username'))
    assert.isNull(parser.unsign('username'))
    assert.isNull(parser.decode('username'))
    assert.deepEqual(Object.keys(parser.list()), ['username'])
  })

  test('handle cookie swap with encrypted cookies', (assert) => {
    const age = serializer.encrypt('age', 22)!.split('=')[1]
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

  test('handle cookie swap with signed cookies', (assert) => {
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
