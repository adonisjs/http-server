/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Exception } from '@poppinss/utils'
import { LoggerFactory } from '@adonisjs/logger/factories'

import { errors, HttpContext } from '../../index.js'
import { HttpContextFactory } from '../../factories/http_context.js'
import { HttpExceptionHandler } from '../../src/exception_handler.js'
import { StatusPageRange, StatusPageRenderer } from '../../src/types/server.js'

test.group('Exception handler | handle', () => {
  test('handle error by pretty printing it using youch', async ({ assert }) => {
    const logger = new LoggerFactory().create()
    const exceptionHandler = new HttpExceptionHandler(logger)
    const ctx = new HttpContextFactory().create()

    const error = new Error('Something went wrong')
    await exceptionHandler.handle(error, ctx)

    assert.equal(ctx.response.getStatus(), 500)
    assert.match(ctx.response.getBody(), /<html/)
  })

  test('pretty error as JSON when request accepts JSON', async ({ assert }) => {
    const logger = new LoggerFactory().create()
    const exceptionHandler = new HttpExceptionHandler(logger)
    const ctx = new HttpContextFactory().create()

    ctx.request.request.headers['accept'] = 'application/json'

    const error = new Error('Something went wrong')
    await exceptionHandler.handle(error, ctx)

    assert.equal(ctx.response.getStatus(), 500)
    assert.isObject(ctx.response.getBody())
    assert.properties(ctx.response.getBody(), ['message', 'frames'])
  })

  test('pretty error as JSON when request accepts JSONAPI', async ({ assert }) => {
    const logger = new LoggerFactory().create()
    const exceptionHandler = new HttpExceptionHandler(logger)
    const ctx = new HttpContextFactory().create()

    ctx.request.request.headers['accept'] = 'application/vnd.api+json'

    const error = new Error('Something went wrong')
    await exceptionHandler.handle(error, ctx)

    assert.equal(ctx.response.getStatus(), 500)
    assert.isObject(ctx.response.getBody())
    assert.properties(ctx.response.getBody(), ['message', 'frames'])
  })

  test('do not render stack trace when debugging is disabled', async ({ assert }) => {
    class AppExceptionHandler extends HttpExceptionHandler {
      protected debug: boolean = false
    }

    const logger = new LoggerFactory().create()
    const exceptionHandler = new AppExceptionHandler(logger)
    const ctx = new HttpContextFactory().create()

    const error = new Error('Something went wrong')
    await exceptionHandler.handle(error, ctx)

    assert.equal(ctx.response.getStatus(), 500)
    assert.equal(ctx.response.getBody(), '<p> Something went wrong </p>')
  })

  test('do not render stack trace in JSON response when debugging is disabled', async ({
    assert,
  }) => {
    class AppExceptionHandler extends HttpExceptionHandler {
      protected debug: boolean = false
    }

    const logger = new LoggerFactory().create()
    const exceptionHandler = new AppExceptionHandler(logger)
    const ctx = new HttpContextFactory().create()
    ctx.request.request.headers['accept'] = 'application/json'

    const error = new Error('Something went wrong')
    await exceptionHandler.handle(error, ctx)

    assert.equal(ctx.response.getStatus(), 500)
    assert.deepEqual(ctx.response.getBody(), { message: 'Something went wrong' })
  })

  test('do not render stack trace in JSON API response when debugging is disabled', async ({
    assert,
  }) => {
    class AppExceptionHandler extends HttpExceptionHandler {
      protected debug: boolean = false
    }

    const logger = new LoggerFactory().create()
    const exceptionHandler = new AppExceptionHandler(logger)
    const ctx = new HttpContextFactory().create()
    ctx.request.request.headers['accept'] = 'application/vnd.api+json'

    const error = new Error('Something went wrong')
    await exceptionHandler.handle(error, ctx)

    assert.equal(ctx.response.getStatus(), 500)
    assert.deepEqual(ctx.response.getBody(), {
      errors: [
        {
          code: undefined,
          status: 500,
          title: 'Something went wrong',
        },
      ],
    })
  })

  test('use error status code', async ({ assert }) => {
    const logger = new LoggerFactory().create()
    const exceptionHandler = new HttpExceptionHandler(logger)
    const ctx = new HttpContextFactory().create()

    const error = new Exception('Something went wrong', { status: 401 })
    await exceptionHandler.handle(error, ctx)

    assert.equal(ctx.response.getStatus(), 401)
  })

  test('render error using the error handle method', async ({ assert }) => {
    const logger = new LoggerFactory().create()
    const exceptionHandler = new HttpExceptionHandler(logger)
    const ctx = new HttpContextFactory().create()

    class MyError extends Exception {
      handle(error: this, { response }: HttpContext) {
        response.status(error.status).send('self handled error')
      }
    }

    const error = new MyError('Something went wrong', { status: 401 })
    await exceptionHandler.handle(error, ctx)

    assert.equal(ctx.response.getStatus(), 401)
    assert.equal(ctx.response.getBody(), 'self handled error')
  })

  test('render status page', async ({ assert }) => {
    class AppExceptionHandler extends HttpExceptionHandler {
      protected renderStatusPages: boolean = true
      protected statusPages: Record<StatusPageRange, StatusPageRenderer> = {
        '400..499': (error, ctx) => {
          return ctx.response.status(error.status).send('400 status page')
        },
      }
    }

    const logger = new LoggerFactory().create()
    const exceptionHandler = new AppExceptionHandler(logger)
    const ctx = new HttpContextFactory().create()

    class MyError extends Exception {}

    const error = new MyError('Something went wrong', { status: 401 })
    await exceptionHandler.handle(error, ctx)

    assert.equal(ctx.response.getStatus(), 401)
    assert.equal(ctx.response.getBody(), '400 status page')
  })

  test('do not render status page when exception has handle method', async ({ assert }) => {
    class AppExceptionHandler extends HttpExceptionHandler {
      protected renderStatusPages: boolean = true
      protected statusPages: Record<StatusPageRange, StatusPageRenderer> = {
        '400..499': (error, ctx) => {
          return ctx.response.status(error.status).send('400 status page')
        },
      }
    }

    const logger = new LoggerFactory().create()
    const exceptionHandler = new AppExceptionHandler(logger)
    const ctx = new HttpContextFactory().create()

    class MyError extends Exception {
      handle(error: this, { response }: HttpContext) {
        response.status(error.status).send('self handled error')
      }
    }

    const error = new MyError('Something went wrong', { status: 401 })
    await exceptionHandler.handle(error, ctx)

    assert.equal(ctx.response.getStatus(), 401)
    assert.equal(ctx.response.getBody(), 'self handled error')
  })

  test('handle literal values raised as exception', async ({ assert }) => {
    const logger = new LoggerFactory().create()
    const exceptionHandler = new HttpExceptionHandler(logger)
    const ctx = new HttpContextFactory().create()

    ctx.request.request.headers['accept'] = 'application/json'

    const error = 'Something went wrong'
    await exceptionHandler.handle(error, ctx)

    assert.equal(ctx.response.getStatus(), 500)
    assert.deepEqual(ctx.response.getBody().message, 'Something went wrong')
  })
})

test.group('Exception handler | report', () => {
  test('report error using logger', async ({ assert }) => {
    const logs: string[] = []
    const logger = new LoggerFactory().pushLogsTo(logs).merge({ enabled: true }).create()
    const exceptionHandler = new HttpExceptionHandler(logger)
    const ctx = new HttpContextFactory().create()

    const error = new Error('Something went wrong')
    await exceptionHandler.report(error, ctx)

    const parsedLogs = logs.map((line) => {
      const logLine = JSON.parse(line)
      return { message: logLine.msg, level: logLine.level, err: logLine.err }
    })

    assert.lengthOf(parsedLogs, 1)
    assert.equal(parsedLogs[0].message, 'Something went wrong')
    assert.exists(parsedLogs[0].err)
    assert.equal(parsedLogs[0].level, 50)
  })

  test('report errors with status code in 400 range as a warning', async ({ assert }) => {
    const logs: string[] = []
    const logger = new LoggerFactory().pushLogsTo(logs).merge({ enabled: true }).create()
    const exceptionHandler = new HttpExceptionHandler(logger)
    const ctx = new HttpContextFactory().create()

    const error = new Exception('Something went wrong', { status: 410 })
    await exceptionHandler.report(error, ctx)

    const parsedLogs = logs.map((line) => {
      const logLine = JSON.parse(line)
      return { message: logLine.msg, level: logLine.level, err: logLine.err }
    })

    assert.lengthOf(parsedLogs, 1)
    assert.equal(parsedLogs[0].message, 'Something went wrong')
    assert.notExists(parsedLogs[0].err)
    assert.equal(parsedLogs[0].level, 40)
  })

  test('report errors with status code below 400 as info', async ({ assert }) => {
    const logs: string[] = []
    const logger = new LoggerFactory().pushLogsTo(logs).merge({ enabled: true }).create()
    const exceptionHandler = new HttpExceptionHandler(logger)
    const ctx = new HttpContextFactory().create()

    const error = new Exception('Something went wrong', { status: 302 })
    await exceptionHandler.report(error, ctx)

    const parsedLogs = logs.map((line) => {
      const logLine = JSON.parse(line)
      return { message: logLine.msg, level: logLine.level, err: logLine.err }
    })

    assert.lengthOf(parsedLogs, 1)
    assert.equal(parsedLogs[0].message, 'Something went wrong')
    assert.notExists(parsedLogs[0].err)
    assert.equal(parsedLogs[0].level, 30)
  })

  test('do not report 400, 422 and 401 error codes', async ({ assert }) => {
    const logs: string[] = []
    const logger = new LoggerFactory().pushLogsTo(logs).merge({ enabled: true }).create()
    const exceptionHandler = new HttpExceptionHandler(logger)
    const ctx = new HttpContextFactory().create()

    await exceptionHandler.report(new Exception('Something went wrong', { status: 400 }), ctx)
    await exceptionHandler.report(new Exception('Something went wrong', { status: 401 }), ctx)
    await exceptionHandler.report(new Exception('Something went wrong', { status: 422 }), ctx)

    const parsedLogs = logs.map((line) => {
      const logLine = JSON.parse(line)
      return { message: logLine.msg, level: logLine.level, err: logLine.err }
    })

    assert.lengthOf(parsedLogs, 0)
  })

  test('do not report internal exceptions', async ({ assert }) => {
    const logs: string[] = []
    const logger = new LoggerFactory().pushLogsTo(logs).merge({ enabled: true }).create()
    const exceptionHandler = new HttpExceptionHandler(logger)
    const ctx = new HttpContextFactory().create()

    await exceptionHandler.report(new errors.E_CANNOT_LOOKUP_ROUTE(['/']), ctx)
    await exceptionHandler.report(new errors.E_HTTP_EXCEPTION(), ctx)
    await exceptionHandler.report(new errors.E_HTTP_REQUEST_ABORTED(), ctx)
    await exceptionHandler.report(new errors.E_ROUTE_NOT_FOUND(['GET', '/']), ctx)

    const parsedLogs = logs.map((line) => {
      const logLine = JSON.parse(line)
      return { message: logLine.msg, level: logLine.level, err: logLine.err }
    })

    assert.lengthOf(parsedLogs, 0)
  })

  test('do not report when error reporting is turned off', async ({ assert }) => {
    class AppExceptionHandler extends HttpExceptionHandler {
      protected reportErrors: boolean = false
    }

    const logs: string[] = []
    const logger = new LoggerFactory().pushLogsTo(logs).merge({ enabled: true }).create()
    const exceptionHandler = new AppExceptionHandler(logger)
    const ctx = new HttpContextFactory().create()

    const error = new Exception('Something went wrong')
    await exceptionHandler.report(error, ctx)

    const parsedLogs = logs.map((line) => {
      const logLine = JSON.parse(line)
      return { message: logLine.msg, level: logLine.level, err: logLine.err }
    })

    assert.lengthOf(parsedLogs, 0)
  })

  test('report error using the error report method', async ({ assert }) => {
    const logs: string[] = []
    const logger = new LoggerFactory().pushLogsTo(logs).merge({ enabled: true }).create()
    const exceptionHandler = new HttpExceptionHandler(logger)
    const ctx = new HttpContextFactory().create()

    class MyError extends Exception {
      report() {
        logger.error('custom error reporting')
      }
    }

    const error = new MyError('Something went wrong')
    await exceptionHandler.report(error, ctx)

    const parsedLogs = logs.map((line) => {
      const logLine = JSON.parse(line)
      return { message: logLine.msg, level: logLine.level, err: logLine.err }
    })

    assert.lengthOf(parsedLogs, 1)
    assert.equal(parsedLogs[0].message, 'custom error reporting')
    assert.notExists(parsedLogs[0].err)
    assert.equal(parsedLogs[0].level, 50)
  })

  test('ignore error codes when reporting error', async ({ assert }) => {
    class AppExceptionHandler extends HttpExceptionHandler {
      protected ignoreCodes: string[] = ['E_CUSTOM_ERROR']
    }

    const logs: string[] = []
    const logger = new LoggerFactory().pushLogsTo(logs).merge({ enabled: true }).create()
    const exceptionHandler = new AppExceptionHandler(logger)
    const ctx = new HttpContextFactory().create()

    new Exception('Something went wrong', { code: 'E_CUSTOM_ERROR' })

    await exceptionHandler.report(
      new Exception('Something went wrong', { code: 'E_CUSTOM_ERROR' }),
      ctx
    )

    const parsedLogs = logs.map((line) => {
      const logLine = JSON.parse(line)
      return { message: logLine.msg, level: logLine.level, err: logLine.err }
    })

    assert.lengthOf(parsedLogs, 0)
  })

  test('log request id in logs when request id exists', async ({ assert }) => {
    const logs: string[] = []
    const logger = new LoggerFactory().pushLogsTo(logs).merge({ enabled: true }).create()
    const exceptionHandler = new HttpExceptionHandler(logger)
    const ctx = new HttpContextFactory().create()

    ctx.request.request.headers['x-request-id'] = '123'

    const error = new Exception('Something went wrong', { status: 302 })
    await exceptionHandler.report(error, ctx)

    const parsedLogs = logs.map((line) => {
      const logLine = JSON.parse(line)
      return { message: logLine.msg, level: logLine.level, requestId: logLine['x-request-id'] }
    })

    assert.lengthOf(parsedLogs, 1)
    assert.equal(parsedLogs[0].message, 'Something went wrong')
    assert.equal(parsedLogs[0].requestId, '123')
    assert.equal(parsedLogs[0].level, 30)
  })
})
