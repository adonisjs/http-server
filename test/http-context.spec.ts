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
import { Logger } from '@adonisjs/logger/build/standalone'
import { Profiler } from '@adonisjs/profiler/build/standalone'

test.group('Http Context', () => {
  test('create fake Http context instance', async (assert) => {
    const logger = new Logger({ enabled: true, name: 'adonis', level: 'trace' })
    const profiler = new Profiler({})

    const ctx = HttpContext.create('/', {}, logger, profiler.create('ctx'))

    assert.instanceOf(ctx, HttpContext)
    assert.equal(ctx.route!.pattern, '/')
    assert.deepEqual(ctx.route!.middleware, [])
  })

  test('compute request url from params', async (assert) => {
    const logger = new Logger({ enabled: true, name: 'adonis', level: 'trace' })
    const profiler = new Profiler({})

    const ctx = HttpContext.create('/:id', { id: '1' }, logger, profiler.create('ctx'))

    assert.instanceOf(ctx, HttpContext)
    assert.equal(ctx.route!.pattern, '/:id')
    assert.equal(ctx.request.url(), '/1')
    assert.deepEqual(ctx.params, { id: '1' })
  })
})
