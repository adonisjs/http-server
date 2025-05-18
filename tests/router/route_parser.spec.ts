/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// @ts-expect-error
import matchit from '@poppinss/matchit'
import { test } from '@japa/runner'
import { parse } from '../../src/utils.js'

test.group('Route parser', () => {
  test('parse route with params', ({ assert }) => {
    const tokens = parse('/posts/:id')
    assert.deepEqual(tokens, [
      {
        end: '',
        old: '/posts/:id',
        type: 0,
        val: 'posts',
      },
      {
        cast: undefined,
        end: '',
        matcher: undefined,
        old: '/posts/:id',
        type: 1,
        val: 'id',
      },
    ])

    assert.deepEqual(matchit.exec('/posts/10', tokens), { id: '10' })
  })

  test('parse route params with extensions', ({ assert }) => {
    const tokens = parse('/posts/:id.json')
    assert.deepEqual(tokens, [
      {
        end: '',
        old: '/posts/:id.json',
        type: 0,
        val: 'posts',
      },
      {
        cast: undefined,
        end: '.json',
        matcher: undefined,
        old: '/posts/:id.json',
        type: 1,
        val: 'id',
      },
    ])

    assert.deepEqual(matchit.exec('/posts/10.json', tokens), { id: '10' })
  })

  test('do not allow extensions with optional params', ({ assert }) => {
    const tokens = parse('/posts/:id?.json')
    assert.deepEqual(tokens, [
      {
        end: '',
        old: '/posts/:id?.json',
        type: 0,
        val: 'posts',
      },
      {
        cast: undefined,
        end: '.json',
        matcher: undefined,
        old: '/posts/:id?.json',
        type: 3,
        val: 'id?', // This is invalid
      },
    ])

    assert.deepEqual(matchit.exec('/posts/10.json', tokens), { 'id?': '10' })
    assert.deepEqual(matchit.exec('/posts', tokens), {})
  })

  test('parse route params wildcard', ({ assert }) => {
    const tokens = parse('/posts/*')
    assert.deepEqual(tokens, [
      {
        end: '',
        old: '/posts/*',
        type: 0,
        val: 'posts',
      },
      {
        end: '',
        old: '/posts/*',
        type: 2,
        val: '*',
      },
    ])

    assert.deepEqual(matchit.exec('/posts/10/hello-world', tokens), { '*': ['10', 'hello-world'] })
  })
})
