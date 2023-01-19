/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { E_HTTP_EXCEPTION } from '../../src/exceptions.js'

test.group('Http exception', () => {
  test('create http exception with an error object', ({ assert }) => {
    const error = new Error('Something went wrong')
    const exception = E_HTTP_EXCEPTION.invoke(new Error('Something went wrong'), 500)

    assert.deepEqual(exception.body, error)
    assert.equal(exception.message, 'Something went wrong')
    assert.equal(exception.status, 500)
    assert.equal(exception.code, 'E_HTTP_EXCEPTION')
  })

  test('create http exception with a string message', ({ assert }) => {
    const exception = E_HTTP_EXCEPTION.invoke('Something went wrong', 500)

    assert.deepEqual(exception.body, 'Something went wrong')
    assert.equal(exception.message, 'Something went wrong')
    assert.equal(exception.status, 500)
    assert.equal(exception.code, 'E_HTTP_EXCEPTION')
  })

  test('create http exception with an error of values', ({ assert }) => {
    const exception = E_HTTP_EXCEPTION.invoke([{ message: 'Something went wrong' }], 500)

    assert.deepEqual(exception.body, [{ message: 'Something went wrong' }])
    assert.equal(exception.message, 'HTTP Exception')
    assert.equal(exception.status, 500)
    assert.equal(exception.code, 'E_HTTP_EXCEPTION')
  })

  test('create http exception with an object without message', ({ assert }) => {
    const exception = E_HTTP_EXCEPTION.invoke(
      { errors: [{ message: 'Something went wrong' }] },
      500
    )

    assert.deepEqual(exception.body, { errors: [{ message: 'Something went wrong' }] })
    assert.equal(exception.message, 'HTTP Exception')
    assert.equal(exception.status, 500)
    assert.equal(exception.code, 'E_HTTP_EXCEPTION')
  })

  test('create http exception with null body', ({ assert }) => {
    const exception = E_HTTP_EXCEPTION.invoke(null, 500)

    assert.deepEqual(exception.body, 'Internal server error')
    assert.equal(exception.message, 'HTTP Exception')
    assert.equal(exception.status, 500)
    assert.equal(exception.code, 'E_HTTP_EXCEPTION')
  })

  test('create http exception with undefined body', ({ assert }) => {
    const exception = E_HTTP_EXCEPTION.invoke(undefined, 500)

    assert.deepEqual(exception.body, 'Internal server error')
    assert.equal(exception.message, 'HTTP Exception')
    assert.equal(exception.status, 500)
    assert.equal(exception.code, 'E_HTTP_EXCEPTION')
  })
})
