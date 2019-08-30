/*
* @poppinss/http-server
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import test from 'japa'
import { HttpContext } from '../src/HttpContext'

test.group('Http Context', () => {
  test('create fake Http context instance', async (assert) => {
    const ctx = HttpContext.create('/', {})

    assert.instanceOf(ctx, HttpContext)
    assert.equal(ctx.route!.pattern, '/')
    assert.deepEqual(ctx.route!.middleware, [])
  })

  test('compute request url from params', async (assert) => {
    const ctx = HttpContext.create('/:id', { id: '1' })

    assert.instanceOf(ctx, HttpContext)
    assert.equal(ctx.route!.pattern, '/:id')
    assert.equal(ctx.request.url(), '/1')
    assert.deepEqual(ctx.params, { id: '1' })
  })
})
