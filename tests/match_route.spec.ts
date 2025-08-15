/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { matchRoute } from '../src/helpers.ts'

test.group('Match route', () => {
  test('return url params when a match is found', ({ assert }) => {
    assert.deepEqual(matchRoute('/users/1', ['posts/:slug', 'users/:id']), {
      id: '1',
    })
  })

  test('return null when unable to find a match', ({ assert }) => {
    assert.isNull(matchRoute('/customers/1', ['posts/:slug', 'users/:id']))
  })

  test('match routes with wildcards', ({ assert }) => {
    assert.deepEqual(
      matchRoute('/posts/hello-world/1/published', ['posts/:slug', 'posts/:slug/*']),
      {
        'slug': 'hello-world',
        '*': ['1', 'published'],
      }
    )
  })
})
