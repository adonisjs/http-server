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
import { parseRoute } from '../../src/helpers.ts'

test.group('Route parser', () => {
  test('ignore non-object matcher collections like matchit', ({ assert }) => {
    assert.deepEqual(parseRoute('/:0', 'x' as never), matchit.parse('/:0', 'x'))
  })

  test('parse the same tokens as matchit across generated pattern strings', ({ assert }) => {
    const alphabet = ['/', ':', '*', '?', '.', 'a', 'Z', '0', '-', '_', 'é', '😀']
    let seed = 73
    function random() {
      seed = (seed * 1_664_525 + 1_013_904_223) >>> 0
      return seed / 2 ** 32
    }

    for (let iteration = 0; iteration < 10_000; iteration++) {
      const length = Math.floor(random() * 30)
      let pattern = ''
      for (let index = 0; index < length; index++) {
        pattern += alphabet[Math.floor(random() * alphabet.length)]
      }

      assert.deepEqual(parseRoute(pattern), matchit.parse(pattern), pattern)
    }
  })

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

    assert.deepEqual(matchit.exec('/posts/10', tokens), { id: '10' })
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

    assert.deepEqual(matchit.exec('/posts/10.json', tokens), { id: '10' })
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

    assert.deepEqual(matchit.exec('/posts/10.json', tokens), { 'id?': '10' })
    assert.deepEqual(matchit.exec('/posts', tokens), {})
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

    assert.deepEqual(matchit.exec('/posts/10/hello-world', tokens), { '*': ['10', 'hello-world'] })
  })
})
