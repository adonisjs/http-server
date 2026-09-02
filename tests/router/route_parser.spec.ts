/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { parseRoute } from '../../src/helpers.ts'

test.group('Route parser', () => {
  test('parse route with params', ({ assert }) => {
    const tokens = parseRoute('/posts/:id')
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
  })

  test('parse route params with extensions', ({ assert }) => {
    const tokens = parseRoute('/posts/:id.json')
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
  })

  test('do not allow extensions with optional params', ({ assert }) => {
    const tokens = parseRoute('/posts/:id?.json')
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
  })

  test('parse route params wildcard', ({ assert }) => {
    const tokens = parseRoute('/posts/*')
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
  })
})
