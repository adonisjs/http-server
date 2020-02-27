/*
* @poppinss/http-server
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import test from 'japa'
import { HttpContext as BaseHttpContext } from '../src/HttpContext'
import { HttpContextConstructorContract } from '@ioc:Adonis/Core/HttpContext'
import { Logger } from '@adonisjs/logger/build/standalone'
import { Profiler } from '@adonisjs/profiler/build/standalone'
import { Encryption } from '@adonisjs/encryption/build/standalone'

const HttpContext = BaseHttpContext as any as HttpContextConstructorContract
const encryption = new Encryption('averylongrandom32charslongsecret')

test.group('Http Context', () => {
  test('create fake Http context instance', async (assert) => {
    const logger = new Logger({ enabled: true, name: 'adonis', level: 'trace' })
    const profiler = new Profiler(__dirname, logger, {})

    const ctx = HttpContext.create('/', {}, logger, profiler.create('ctx'), encryption)

    assert.instanceOf(ctx, HttpContext)
    assert.equal(ctx.route!.pattern, '/')
    assert.deepEqual(ctx.route!.middleware, [])
  })

  test('compute request url from params', async (assert) => {
    const logger = new Logger({ enabled: true, name: 'adonis', level: 'trace' })
    const profiler = new Profiler(__dirname, logger, {})

    const ctx = HttpContext.create('/:id', { id: '1' }, logger, profiler.create('ctx'), encryption)

    assert.instanceOf(ctx, HttpContext)
    assert.equal(ctx.route!.pattern, '/:id')
    assert.equal(ctx.request.url(), '/1')
    assert.deepEqual(ctx.params, { id: '1' })
  })

  test('add macro to http context', async (assert) => {
    const logger = new Logger({ enabled: true, name: 'adonis', level: 'trace' })
    const profiler = new Profiler(__dirname, logger, {})

    HttpContext.macro('url', function url () {
      return `user/${this.params.id}`
    })

    const ctx = HttpContext.create('/:id', { id: '1' }, logger, profiler.create('ctx'), encryption)

    assert.instanceOf(ctx, HttpContext)
    assert.equal(ctx.route!.pattern, '/:id')
    assert.equal(ctx.request.url(), '/1')
    assert.deepEqual(ctx.params, { id: '1' })
  })

  test('pass ctx to request and response', async (assert) => {
    const logger = new Logger({ enabled: true, name: 'adonis', level: 'trace' })
    const profiler = new Profiler(__dirname, logger, {})

    const ctx = HttpContext.create('/', {}, logger, profiler.create('ctx'), encryption)
    assert.deepEqual(ctx.request.ctx, ctx)
    assert.deepEqual(ctx.response.ctx, ctx)
  })
})
