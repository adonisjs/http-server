/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import etag from 'etag'
import fsExtra from 'fs-extra'
import { join } from 'node:path'
import supertest from 'supertest'
import { test } from '@japa/runner'
import status from 'http-status-codes'
import { Readable } from 'node:stream'
import { fileURLToPath } from 'node:url'
import { createServer } from 'node:http'
import { createWriteStream, createReadStream } from 'node:fs'
import { AppFactory } from '@adonisjs/application/test_factories/app'
import { EncryptionFactory } from '@adonisjs/encryption/test_factories/encryption'

import { Response } from '../src/response.js'
import { CookieParser } from '../src/cookies/parser.js'
import { RouterFactory } from '../test_factories/router.js'
import { ResponseFactory } from '../test_factories/response.js'

const BASE_URL = new URL('./app/', import.meta.url)
const BASE_PATH = fileURLToPath(BASE_URL)

const encryption = new EncryptionFactory().create()
const app = new AppFactory().create(BASE_URL)
const router = new RouterFactory().merge({ app, encryption }).create()

test.group('Response', (group) => {
  group.each.teardown(async () => {
    await fsExtra.remove(BASE_PATH)
  })

  test('set http response headers', async () => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()

      response.header('status', 200)
      response.header('content-type', 'application/json')

      /**
       * Ignore null values
       */
      // @ts-expect-error
      response.header('content-type', null)

      /**
       * Ignore undefined values
       */
      // @ts-expect-error
      response.header('content-type', undefined)

      response.flushHeaders()
      res.end()
    })

    await supertest(server).get('/').expect(200).expect('content-type', 'application/json')
  })

  test('get recently set headers', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()

      response.header('status', 200)
      response.header('content-type', 'application/json')

      const contentType = response.getHeader('Content-Type')

      response.flushHeaders()
      res.end(JSON.stringify({ contentType }))
    })

    const { body } = await supertest(server)
      .get('/')
      .expect(200)
      .expect('content-type', 'application/json')

    assert.deepEqual(body, {
      contentType: 'application/json',
    })
  })

  test('get header from http res object', async ({ assert }) => {
    const server = createServer((req, res) => {
      res.setHeader('content-type', 'application/json')
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()

      const contentType = response.getHeader('Content-Type')

      response.flushHeaders()
      res.end(JSON.stringify({ contentType }))
    })

    const { body } = await supertest(server)
      .get('/')
      .expect(200)
      .expect('content-type', 'application/json')

    assert.deepEqual(body, {
      contentType: 'application/json',
    })
  })

  test('get merged from http res object', async ({ assert }) => {
    const server = createServer((req, res) => {
      res.setHeader('content-type', 'application/json')
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()

      response.header('x-powered-by', 'adonisjs')

      response.flushHeaders()
      res.end(JSON.stringify(response.getHeaders()))
    })

    const { body, headers } = await supertest(server)
      .get('/')
      .expect(200)
      .expect('content-type', 'application/json')

    assert.containsSubset(headers, {
      'content-type': 'application/json',
      'x-powered-by': 'adonisjs',
    })

    assert.deepEqual(body, {
      'content-type': 'application/json',
      'x-powered-by': 'adonisjs',
    })
  })

  test('append header to existing header', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()

      response.header('set-cookie', 'username=virk')
      response.append('set-cookie', 'age=22')

      /**
       * Ignore null values
       */
      // @ts-expect-error
      response.append('set-cookie', null)

      /**
       * Ignore undefined values
       */
      // @ts-expect-error
      response.append('set-cookie', undefined)

      response.flushHeaders()
      res.end()
    })

    const { header } = await supertest(server).get('/')
    assert.deepEqual(header['set-cookie'], ['username=virk', 'age=22'])
  })

  test("add header via append when header doesn't exists already", async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()

      response.append('set-cookie', 'age=22')
      response.flushHeaders()
      res.end()
    })

    const { header } = await supertest(server).get('/')
    assert.deepEqual(header['set-cookie'], ['age=22'])
  })

  test("append to the header value when it's an array", async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()

      response.append('set-cookie', ['username=virk'])
      response.append('set-cookie', ['age=22'])
      response.flushHeaders()
      res.end()
    })

    const { header } = await supertest(server).get('/')
    assert.deepEqual(header['set-cookie'], ['username=virk', 'age=22'])
  })

  test('do not set header when already exists', async () => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()

      response.header('content-type', 'application/json')
      response.safeHeader('content-type', 'text/html')
      response.flushHeaders()
      res.end()
    })

    await supertest(server).get('/').expect('content-type', 'application/json')
  })

  test('remove existing response header', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()

      response.header('content-type', 'application/json')
      response.removeHeader('content-type')
      response.flushHeaders()
      res.end()
    })

    const { header } = await supertest(server).get('/')
    assert.notProperty(header, 'content-type')
  })

  test('set HTTP status', async () => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()

      response.status(201)
      response.flushHeaders()
      res.end()
    })

    await supertest(server).get('/').expect(201)
  })

  test('parse buffer and set correct response header', async () => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()

      response.send(Buffer.from('hello'))
      response.finish()
    })

    await supertest(server)
      .get('/')
      .expect('content-type', 'application/octet-stream; charset=utf-8')
  })

  test('parse string and set correct response header', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.send('hello')
      response.finish()
    })

    const { text } = await supertest(server)
      .get('/')
      .expect('content-type', 'text/plain; charset=utf-8')
    assert.equal(text, 'hello')
  })

  test('parse HTML string and return correct response header', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()

      response.send('<p> hello </p>')
      response.finish()
    })

    const { text } = await supertest(server)
      .get('/')
      .expect('content-type', 'text/html; charset=utf-8')
    assert.equal(text, '<p> hello </p>')
  })

  test('get regex in response', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()

      response.send(/foo/)
      response.finish()
    })

    const { text } = await supertest(server)
      .get('/')
      .expect('content-type', 'text/plain; charset=utf-8')
    assert.equal(text, '/foo/')
  })

  test('parse array and set correct response type', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.send([1, 2])
      response.finish()
    })

    const { body } = await supertest(server)
      .get('/')
      .expect('content-type', 'application/json; charset=utf-8')
    assert.deepEqual(body, [1, 2])
  })

  test('parse object and set correct response type', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.send({ username: 'virk' })
      response.finish()
    })

    const { body } = await supertest(server)
      .get('/')
      .expect('content-type', 'application/json; charset=utf-8')
    assert.deepEqual(body, { username: 'virk' })
  })

  test('do not set content type for empty strings', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.send('')
      response.finish()
    })

    const { text } = await supertest(server).get('/').expect(204)
    assert.deepEqual(text, '')
  })

  test('do not set content-type for null', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.send(null)
      response.finish()
    })

    const { text } = await supertest(server).get('/').expect(204)
    assert.deepEqual(text, '')
  })

  test('do not write send body and headers unless finish is called explicitly', async ({
    assert,
  }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()

      response.send({ username: 'virk' })
      res.write('hello')
      res.end()
    })

    const { text } = await supertest(server).get('/')
    assert.equal(text, 'hello')
  })

  test('write send body and headers when finish is called explicitly', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.send({ username: 'virk' })
      response.finish()
    })

    const { body } = await supertest(server)
      .get('/')
      .expect('content-type', 'application/json; charset=utf-8')
      .expect('content-length', '19')

    assert.deepEqual(body, { username: 'virk' })
  })

  test('do not write response twice if finish is called twice', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()

      response.json({ username: 'virk' })
      response.finish()
      response.finish()
    })

    const { body } = await supertest(server)
      .get('/')
      .expect('content-type', 'application/json; charset=utf-8')
      .expect('content-length', '19')

    assert.deepEqual(body, { username: 'virk' })
  })

  test('hasContent must return true after send has been called', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()

      response.json({ username: 'virk' })
      res.end(String(response.hasContent))
    })

    const { text } = await supertest(server).get('/')
    assert.equal(text, 'true')
  })

  test('hasLazyBody must return true after send has been called', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()

      response.json({ username: 'virk' })
      res.end(String(response.hasLazyBody))
    })

    const { text } = await supertest(server).get('/')
    assert.equal(text, 'true')
  })

  test('hasLazyBody must return true after download has been called', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()

      response.download('./foo.html')
      res.end(String(response.hasLazyBody))
    })

    const { text } = await supertest(server).get('/')
    assert.equal(text, 'true')
  })

  test('hasContent must return false after download has been called', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()

      response.download('./foo.html')
      res.end(String(response.hasContent))
    })

    const { text } = await supertest(server).get('/')
    assert.equal(text, 'false')
  })

  test('hasLazyBody must return true after stream has been called', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()

      response.stream(new Readable())
      res.end(String(response.hasLazyBody))
    })

    const { text } = await supertest(server).get('/')
    assert.equal(text, 'true')
  })

  test('hasContent must return false after stream has been called', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()

      response.stream(new Readable())
      res.end(String(response.hasContent))
    })

    const { text } = await supertest(server).get('/')
    assert.equal(text, 'false')
  })

  test('write jsonp response', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.jsonp({ username: 'virk' })
      response.finish()
    })

    const { text } = await supertest(server).get('/')

    const body = { username: 'virk' }
    assert.equal(text, `/**/ typeof callback === 'function' && callback(${JSON.stringify(body)});`)
  })

  test('use explicit value for callback name', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.jsonp({ username: 'virk' }, 'fn')
      response.finish()
    })

    const { text } = await supertest(server).get('/?callback=cb')

    const body = { username: 'virk' }
    assert.equal(text, `/**/ typeof fn === 'function' && fn(${JSON.stringify(body)});`)
  })

  test('use config value when explicit value is not defined and their is no query string', async ({
    assert,
  }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory()
        .merge({
          req,
          res,
          encryption,
          router,
          config: {
            jsonpCallbackName: 'cb',
          },
        })
        .create()

      response.jsonp({ username: 'virk' })
      response.finish()
    })

    const { text } = await supertest(server).get('/')

    const body = { username: 'virk' }
    assert.equal(text, `/**/ typeof cb === 'function' && cb(${JSON.stringify(body)});`)
  })

  test('stream response', async ({ assert }) => {
    await fsExtra.outputFile(join(BASE_PATH, 'hello.txt'), 'hello world')

    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.stream(createReadStream(join(BASE_PATH, 'hello.txt')))
      assert.isTrue(response.hasStream)
      response.finish()
    })

    const { text } = await supertest(server).get('/')
    assert.equal(text, 'hello world')
  })

  test('raise error when we try to stream a non-existing file', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.stream(createReadStream(join(BASE_PATH, 'i-dont-exist.txt')))
      response.finish()
    })

    const { text, status: statusCode } = await supertest(server).get('/')
    assert.equal(statusCode, 404)
    assert.equal(text, 'File not found')
  })

  test('raise error when input is not a stream', async ({ assert }) => {
    assert.plan(1)

    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()

      const stream = response.stream as any
      const fn = () => stream('hello')
      assert.throws(fn, 'response.stream accepts a readable stream only')
      response.finish()
    })

    await supertest(server).get('/')
  })

  test('raise error when input is a writable stream', async ({ assert }) => {
    assert.plan(1)
    await fsExtra.ensureDir(BASE_PATH)

    const server = createServer(async (req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      const writeStream = createWriteStream(join(BASE_PATH, 'hello.txt'))

      const stream = response.stream as any
      const fn = () => stream(writeStream)
      assert.throws(fn, 'response.stream accepts a readable stream only')
      writeStream.close()
      response.finish()
    })

    await supertest(server).get('/')
  })

  test('should not hit the maxListeners when making more than 10 calls', async () => {
    await fsExtra.outputFile(join(BASE_PATH, 'hello.txt'), 'hello world')

    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.stream(createReadStream(join(BASE_PATH, 'hello.txt')))
      response.finish()
    })

    const requests = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(() =>
      supertest(server).get('/').expect(200)
    )
    await Promise.all(requests)
  })

  test('raise error when stream raises one', async ({ assert }) => {
    await fsExtra.outputFile(join(BASE_PATH, 'hello.txt'), 'hello world')

    const server = createServer(async (req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()

      const readStream = createReadStream(join(BASE_PATH, 'hello.txt'))

      /**
       * Forcing stream to emit error
       */
      readStream._read = function _read() {
        readStream.emit('error', new Error('Missing file'))
      }

      response.stream(readStream, ({ message }) => [message])
      response.finish()
    })

    const { text } = await supertest(server).get('/')
    assert.equal(text, 'Missing file')
  })

  test('send stream errors vs raising them', async ({ assert }) => {
    await fsExtra.outputFile(join(BASE_PATH, 'hello.txt'), 'hello world')

    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()

      const readStream = createReadStream(join(BASE_PATH, 'hello.txt'))

      /**
       * Forcing stream to emit error
       */
      readStream._read = function _read() {
        readStream.emit('error', new Error('Missing file'))
      }

      response.stream(readStream)
      response.finish()
    })

    const { text } = await supertest(server).get('/')
    assert.equal(text, 'Cannot process file')
  })

  test('download file with correct content type', async ({ assert }) => {
    await fsExtra.outputFile(join(BASE_PATH, 'hello.html'), '<p> hello world </p>')

    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.download(join(BASE_PATH, 'hello.html'))
      assert.isTrue(response.hasStream)
      response.finish()
    })

    const { text } = await supertest(server)
      .get('/')
      .expect('content-type', 'text/html; charset=utf-8')
      .expect('content-length', '20')

    assert.equal(text, '<p> hello world </p>')
  })

  test('write errors as response when downloading folder', async ({ assert }) => {
    await fsExtra.ensureDir(BASE_PATH)

    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.download(join(BASE_PATH))
      response.finish()
    })

    const { text } = await supertest(server).get('/').expect(500)
    assert.equal(text, 'Cannot process file')
  })

  test('write errors as response when file is missing', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.download(join(BASE_PATH, 'hello.html'))
      response.finish()
    })

    const { text, header } = await supertest(server).get('/').expect(404)
    assert.equal(text, 'File not found')
    assert.equal(header['content-type'], 'text/plain; charset=utf-8')
  })

  test('return custom message and status when file is missing', async ({ assert }) => {
    const server = createServer(async (req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()

      response.download(join(BASE_PATH, 'hello.html'), false, () => {
        return ['Missing file', 400]
      })
      response.finish()
    })

    const { text } = await supertest(server).get('/').expect(400)
    assert.equal(text, 'Missing file')
  })

  test('do not stream file on HEAD calls', async ({ assert }) => {
    await fsExtra.outputFile(join(BASE_PATH, 'hello.html'), '<p> hello world </p>')

    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.download(join(BASE_PATH, 'hello.html'))
      response.finish()
    })

    const { text } = await supertest(server).head('/').expect(200)
    assert.isUndefined(text)
  })

  test('do not stream file when cache is fresh', async ({ assert }) => {
    await fsExtra.outputFile(join(BASE_PATH, 'hello.html'), '<p> hello world </p>')

    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.download(join(BASE_PATH, 'hello.html'), true)
      response.finish()
    })

    const stats = await fsExtra.stat(join(BASE_PATH, 'hello.html'))

    const { text } = await supertest(server)
      .get('/')
      .set('if-none-match', etag(stats, { weak: true }))
      .expect(304)

    assert.equal(text, '')
  })

  test('set HTTP status to 304 when cache is fresh and request is HEAD', async ({ assert }) => {
    await fsExtra.outputFile(join(BASE_PATH, 'hello.html'), '<p> hello world </p>')

    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.download(join(BASE_PATH, 'hello.html'), true)
      response.finish()
    })

    const stats = await fsExtra.stat(join(BASE_PATH, 'hello.html'))

    const { text } = await supertest(server)
      .head('/')
      .set('if-none-match', etag(stats, { weak: true }))
      .expect(304)

    assert.isUndefined(text)
  })

  test('set HTTP status to 304 when cache is fresh and request is GET', async ({ assert }) => {
    await fsExtra.outputFile(join(BASE_PATH, 'hello.html'), '<p> hello world </p>')

    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.download(join(BASE_PATH, 'hello.html'), true)
      response.finish()
    })

    const stats = await fsExtra.stat(join(BASE_PATH, 'hello.html'))

    const { text } = await supertest(server)
      .get('/')
      .set('if-none-match', etag(stats, { weak: true }))
      .expect(304)

    assert.equal(text, '')
  })

  test('serve actual response when cache is fresh but request method is POST', async ({
    assert,
  }) => {
    await fsExtra.outputFile(join(BASE_PATH, 'hello.html'), '<p> hello world </p>')

    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.download(join(BASE_PATH, 'hello.html'), true)
      response.finish()
    })

    const stats = await fsExtra.stat(join(BASE_PATH, 'hello.html'))

    const { text } = await supertest(server)
      .post('/')
      .set('if-none-match', etag(stats, { weak: true }))
      .expect(200)

    assert.equal(text, '<p> hello world </p>')
  })

  test('do not override status when cache is fresh but redirect status code is set', async ({
    assert,
  }) => {
    await fsExtra.outputFile(join(BASE_PATH, 'hello.html'), '<p> hello world </p>')

    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.status(301)
      response.download(join(BASE_PATH, 'hello.html'), true)
      response.finish()
    })

    const stats = await fsExtra.stat(join(BASE_PATH, 'hello.html'))

    const { text } = await supertest(server)
      .get('/')
      .set('if-none-match', etag(stats, { weak: true }))
      .expect(301)

    assert.equal(text, '<p> hello world </p>')
  })

  test('download file with correct content disposition', async ({ assert }) => {
    await fsExtra.outputFile(join(BASE_PATH, 'hello.html'), '<p> hello world </p>')

    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.attachment(join(BASE_PATH, 'hello.html'))
      response.finish()
    })

    const { text } = await supertest(server)
      .get('/')
      .expect('content-type', 'text/html; charset=utf-8')
      .expect('Content-length', '20')
      .expect('Content-Disposition', 'attachment; filename="hello.html"')

    assert.equal(text, '<p> hello world </p>')
  })

  test('download file with custom file name', async ({ assert }) => {
    await fsExtra.outputFile(join(BASE_PATH, 'hello.html'), '<p> hello world </p>')

    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.attachment(join(BASE_PATH, 'hello.html'), 'ooo.html')
      response.finish()
    })

    const { text } = await supertest(server)
      .get('/')
      .expect('content-type', 'text/html; charset=utf-8')
      .expect('Content-length', '20')
      .expect('Content-Disposition', 'attachment; filename="ooo.html"')

    assert.equal(text, '<p> hello world </p>')
  })

  test('download file with custom disposition', async ({ assert }) => {
    await fsExtra.outputFile(join(BASE_PATH, 'hello.html'), '<p> hello world </p>')

    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.attachment(join(BASE_PATH, 'hello.html'), 'ooo.html', 'inline')
      response.finish()
    })

    const { text } = await supertest(server)
      .get('/')
      .expect('content-type', 'text/html; charset=utf-8')
      .expect('Content-length', '20')
      .expect('Content-Disposition', 'inline; filename="ooo.html"')

    assert.equal(text, '<p> hello world </p>')
  })

  test('add multiple vary fields', async () => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.vary('Origin')
      response.vary('Set-Cookie')
      response.finish()
    })

    await supertest(server).get('/').expect('Vary', 'Origin, Set-Cookie')
  })

  test('add multiple vary fields as an array', async () => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.vary(['Origin', 'Set-Cookie'])
      response.finish()
    })

    await supertest(server).get('/').expect('Vary', 'Origin, Set-Cookie')
  })

  test('set status code to 204 when body is empty', async () => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.send('')
      response.finish()
    })

    await supertest(server).get('/').expect(204)
  })

  test('do not override explicit status even when body is empty', async () => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.status(200).send('')
      response.finish()
    })

    await supertest(server).get('/').expect(200)
  })

  test('remove previously set content headers when status code is 304', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.header('Content-type', 'application/json')
      response.status(204)
      response.send({ username: 'virk' })
      response.finish()
    })

    const { header } = await supertest(server).get('/').expect(204)
    assert.isUndefined(header['content-type'])
  })

  test('generate etag when set to true', async () => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory()
        .merge({
          req,
          res,
          encryption,
          router,
          config: {
            etag: true,
          },
        })
        .create()

      response.send({ username: 'virk' })
      response.finish()
    })

    const responseEtag = etag(JSON.stringify({ username: 'virk' }))
    await supertest(server).get('/').expect('Etag', responseEtag)
  })

  test('set HTTP status to 304 when cache is fresh and request is GET', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.send({ username: 'virk' }, true)
      response.finish()
    })

    const { text } = await supertest(server)
      .get('/')
      .set('if-none-match', etag(JSON.stringify({ username: 'virk' }), { weak: true }))
      .expect(304)

    assert.equal(text, '')
  })

  test('convert number to string when sending as response', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.send(22)
      response.finish()
    })

    const { text } = await supertest(server).get('/')
    assert.equal(text, '22')
  })

  test('convert boolean to string when sending as response', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.send(false)
      response.finish()
    })

    const { text } = await supertest(server).get('/')
    assert.equal(text, 'false')
  })

  test('convert date to string when sending as response', async ({ assert }) => {
    const date = new Date()
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.send(date)
      response.finish()
    })

    const { text } = await supertest(server).get('/')
    assert.equal(text, date.toISOString())
  })

  test('raise error when response data type is not valid', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()

      try {
        response.send(function foo() {})
        response.finish()
      } catch (error) {
        res.write(error.message)
        res.end()
      }
    })

    const { text } = await supertest(server).get('/')
    assert.equal(text, 'Cannot serialize "function" to HTTP response')
  })

  test('convert serializable objects to JSON representation', async ({ assert }) => {
    class User {
      toJSON() {
        return {
          username: 'virk',
        }
      }
    }

    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.send(new User())
      response.finish()
    })

    const { body } = await supertest(server).get('/')
    assert.deepEqual(body, { username: 'virk' })
  })

  test('send response as 200 when request method is HEAD and cache is not fresh', async ({
    assert,
  }) => {
    await fsExtra.outputFile(join(BASE_PATH, 'hello.html'), '<p> hello world </p>')

    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.download(join(BASE_PATH, 'hello.html'), true)
      response.finish()
    })

    const { text } = await supertest(server).head('/').set('if-none-match', 'hello').expect(200)

    assert.isUndefined(text)
  })

  test('stream the file when request method is GET and cache is not fresh', async ({ assert }) => {
    await fsExtra.outputFile(join(BASE_PATH, 'hello.html'), '<p> hello world </p>')

    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.download(join(BASE_PATH, 'hello.html'), true)
      response.finish()
    })

    const { text } = await supertest(server).get('/').set('if-none-match', 'hello').expect(200)

    assert.equal(text, '<p> hello world </p>')
  })

  test('set response type with custom charset', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.type('plain/text', 'ascii').send('done')
      response.finish()
    })

    const { text } = await supertest(server)
      .get('/')
      .expect(200)
      .expect('content-type', 'plain/text; charset=ascii')

    assert.equal(text, 'done')
  })

  test('set signed cookie', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.cookie('name', 'virk').send('done')
      response.finish()
    })

    const { header } = await supertest(server).get('/').expect(200)

    const cookies = header['set-cookie'].map((cookie: string) => {
      const [value, ...options] = cookie.split(';')
      const parser = new CookieParser(value, encryption)
      return {
        value: parser.unsign('name'),
        options: options.map((option) => option.trim()),
      }
    })

    assert.deepEqual(cookies, [
      {
        value: 'virk',
        options: ['Max-Age=90', 'Path=/', 'HttpOnly'],
      },
    ])
  })

  test('set plain cookie', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.plainCookie('name', 'virk').send('done')
      response.finish()
    })

    const { header } = await supertest(server).get('/').expect(200)
    const cookies = header['set-cookie'].map((cookie: string) => {
      const [value, ...options] = cookie.split(';')
      const parser = new CookieParser(value, encryption)
      return {
        value: parser.decode('name'),
        options: options.map((option) => option.trim()),
      }
    })

    assert.deepEqual(cookies, [
      {
        value: 'virk',
        options: ['Max-Age=90', 'Path=/', 'HttpOnly'],
      },
    ])
  })

  test('set encrypted cookie', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.encryptedCookie('name', 'virk').send('done')
      response.finish()
    })

    const { header } = await supertest(server).get('/').expect(200)

    const cookies = header['set-cookie'].map((cookie: string) => {
      const [value, ...options] = cookie.split(';')
      const parser = new CookieParser(value, encryption)
      return {
        value: parser.decrypt('name'),
        options: options.map((option) => option.trim()),
      }
    })

    assert.deepEqual(cookies, [
      {
        value: 'virk',
        options: ['Max-Age=90', 'Path=/', 'HttpOnly'],
      },
    ])
  })

  test('do not send cookies with null or undefined values', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.encryptedCookie('encrypted', null)
      response.cookie('signed', null)
      response.plainCookie('plain', null)

      response.send('done')
      response.finish()
    })

    const { header } = await supertest(server).get('/').expect(200)

    const cookies = header['set-cookie']
    assert.isUndefined(cookies)
  })

  test('set cookie with custom domain', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.cookie('name', 'virk', { domain: 'foo.com' }).send('done')
      response.finish()
    })

    const { header } = await supertest(server).get('/').expect(200)

    const cookies = header['set-cookie'].map((cookie: string) => {
      const [value, ...options] = cookie.split(';')
      const parser = new CookieParser(value, encryption)
      return {
        value: parser.unsign('name'),
        options: options.map((option) => option.trim()),
      }
    })

    assert.deepEqual(cookies, [
      {
        value: 'virk',
        options: ['Max-Age=90', 'Domain=foo.com', 'Path=/', 'HttpOnly'],
      },
    ])
  })

  test('clear cookie by setting expiry and maxAge in past', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.clearCookie('name').send('done')
      response.finish()
    })

    const { header } = await supertest(server).get('/').expect(200)

    const cookies = header['set-cookie'].map((cookie: string) => {
      const [value, ...options] = cookie.split(';')
      return {
        value: value.split('=')[1] || null,
        options: options.map((option) => option.trim()),
      }
    })

    assert.deepEqual(cookies, [
      {
        value: null,
        options: ['Max-Age=-1', 'Path=/', 'Expires=Thu, 01 Jan 1970 00:00:00 GMT', 'HttpOnly'],
      },
    ])
  })

  test('abort request by raising exception', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      try {
        response.abort('Bad request')
      } catch (error) {
        error.handle(error, { response })
      }

      response.finish()
    })

    const { text } = await supertest(server).get('/').expect(400)
    assert.equal(text, 'Bad request')
  })

  test('abort request with json body', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      try {
        response.abort({ message: 'Bad request' })
      } catch (error) {
        error.handle(error, { response })
      }

      response.finish()
    })

    const { body } = await supertest(server).get('/').expect(400)
    assert.deepEqual(body, { message: 'Bad request' })
  })

  test('abort request with custom status code', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      try {
        response.abort({ message: 'Not allowed' }, 401)
      } catch (error) {
        error.handle(error, { response })
      }

      response.finish()
    })

    const { body } = await supertest(server).get('/').expect(401)
    assert.deepEqual(body, { message: 'Not allowed' })
  })

  test('abortIf: abort request when condition is truthy', async ({ assert, expectTypeOf }) => {
    const server = createServer((req, res) => {
      const response: Response = new ResponseFactory()
        .merge({ req, res, encryption, router })
        .create()

      function isUserGuest(): boolean {
        return true
      }

      try {
        const isGuest = isUserGuest()
        response.abortIf(isGuest, { message: 'Not allowed' }, 401)
        expectTypeOf(isGuest).toEqualTypeOf<false>()
      } catch (error) {
        error.handle(error, { response })
      }

      response.finish()
    })

    const { body } = await supertest(server).get('/').expect(401)
    assert.deepEqual(body, { message: 'Not allowed' })
  })

  test('abortIf: do not abort request when condition is falsy', async ({ expectTypeOf }) => {
    const server = createServer((req, res) => {
      const response: Response = new ResponseFactory()
        .merge({ req, res, encryption, router })
        .create()

      function isUserGuest(): boolean {
        return false
      }

      try {
        const isGuest = isUserGuest()
        response.abortIf(isGuest, { message: 'Not allowed' }, 401)
        expectTypeOf(isGuest).toEqualTypeOf<false>()
      } catch (error) {
        error.handle(error, { response })
      }

      response.finish()
    })

    await supertest(server).get('/').expect(200)
  })

  test('abortUnless: abort request when condition is falsy', async ({ assert, expectTypeOf }) => {
    const server = createServer((req, res) => {
      const response: Response = new ResponseFactory()
        .merge({ req, res, encryption, router })
        .create()

      function isUserGuest(): boolean {
        return false
      }

      try {
        const isGuest = isUserGuest()
        response.abortUnless(isGuest, { message: 'Not allowed' }, 401)
        expectTypeOf(isGuest).toEqualTypeOf<true>()
      } catch (error) {
        error.handle(error, { response })
      }

      response.finish()
    })

    const { body } = await supertest(server).get('/').expect(401)
    assert.deepEqual(body, { message: 'Not allowed' })
  })

  test('abortUnless: do not abort request when condition is truthy', async ({ expectTypeOf }) => {
    const server = createServer((req, res) => {
      const response: Response = new ResponseFactory()
        .merge({ req, res, encryption, router })
        .create()

      function isUserGuest(): boolean {
        return true
      }

      try {
        const isGuest = isUserGuest()
        response.abortUnless(isGuest, { message: 'Not allowed' }, 401)
        expectTypeOf(isGuest).toEqualTypeOf<true>()
      } catch (error) {
        error.handle(error, { response })
      }

      response.finish()
    })

    await supertest(server).get('/').expect(200)
  })

  test('set appropriate status from the description methods', async ({ assert }) => {
    const req: any = {}
    const res: any = {
      statusCode: null,
    }

    const response = new ResponseFactory().merge({ req, res, encryption, router }).create()

    const methods: string[] = [
      'continue',
      'switchingProtocols',
      'ok',
      'created',
      'accepted',
      'nonAuthoritativeInformation',
      'noContent',
      'resetContent',
      'partialContent',
      'multipleChoices',
      'movedPermanently',
      'movedTemporarily',
      'seeOther',
      'notModified',
      'useProxy',
      'temporaryRedirect',
      'badRequest',
      'unauthorized',
      'paymentRequired',
      'forbidden',
      'notFound',
      'methodNotAllowed',
      'notAcceptable',
      'proxyAuthenticationRequired',
      'requestTimeout',
      'conflict',
      'gone',
      'lengthRequired',
      'preconditionFailed',
      'requestEntityTooLarge',
      'requestUriTooLong',
      'unsupportedMediaType',
      'requestedRangeNotSatisfiable',
      'expectationFailed',
      'unprocessableEntity',
      'tooManyRequests',
      'internalServerError',
      'notImplemented',
      'badGateway',
      'serviceUnavailable',
      'gatewayTimeout',
      'httpVersionNotSupported',
    ]

    methods.forEach((method) => {
      ;(response as any)[method]('')
      let statusText = method.replace(/[A-Z]/g, (g) => `_${g.toLowerCase()}`).toUpperCase()
      statusText = statusText === 'REQUEST_ENTITY_TOO_LARGE' ? 'REQUEST_TOO_LONG' : statusText
      assert.equal(res.statusCode, (status as any)[statusText])
    })
  })

  test('send null in body with an explicit http status code', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.status(202).send(undefined)
      response.finish()
    })

    const { text } = await supertest(server).get('/').expect(202)
    assert.deepEqual(text, '')
  })

  test('do not send body or calculate content-length for a 304 response', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.notModified({ hello: 'world' })
      response.finish()
    })

    const { header } = await supertest(server).get('/').expect(304)
    assert.notProperty(header, 'content-length')
  })

  test('get response body', async ({ assert }) => {
    assert.plan(1)

    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()

      response.send('hello world')
      assert.equal(response.getBody(), 'hello world')
      response.finish()
    })

    await supertest(server).get('/')
  })

  test('return null when body is a stream', async ({ assert }) => {
    assert.plan(1)
    await fsExtra.outputFile(join(BASE_PATH, 'hello.txt'), 'hello world')

    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()

      response.stream(createReadStream(join(BASE_PATH, 'hello.txt')))
      assert.isNull(response.getBody())
      response.finish()
    })

    await supertest(server).get('/')
  })

  test('return response status when not defined explicitly', async ({ assert }) => {
    assert.plan(1)

    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()

      assert.equal(response.getStatus(), 200)
      response.finish()
    })

    await supertest(server).get('/')
  })

  test('return response status when defined explicitly', async ({ assert }) => {
    assert.plan(1)

    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()

      response.status(301)
      assert.equal(response.getStatus(), 301)
      response.finish()
    })

    await supertest(server).get('/')
  })
})
