/*
* @poppinss/response
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import test from 'japa'
import etag from 'etag'
import { join } from 'path'
import supertest from 'supertest'
import { createServer } from 'http'
import { parse } from '@poppinss/cookie'
import { Filesystem } from '@poppinss/dev-utils'
import { createWriteStream, createReadStream } from 'fs'

import { Response } from '../src/Response'
import { ResponseConfigContract } from '@ioc:Adonis/Core/Response'

const SECRET = Math.random().toFixed(36).substring(2, 38)

const fakeConfig = (conf?: Partial<ResponseConfigContract>) => {
  return Object.assign({
    etag: false,
    secret: SECRET,
    jsonpCallbackName: 'callback',
    cookie: {
      maxAge: 90,
      path: '/',
      httpOnly: true,
      sameSite: false,
      secure: false,
    },
  }, conf)
}

const fs = new Filesystem()

test.group('Response', (group) => {
  group.afterEach(async () => {
    await fs.cleanup()
  })

  test('set http response headers', async () => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)

      response.header('status', 200)
      response.header('content-type', 'application/json')
      response.flushHeaders()
      res.end()
    })

    await supertest(server).get('/').expect(200).expect('content-type', 'application/json')
  })

  test('get recently set headers', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)

      response.header('status', 200)
      response.header('content-type', 'application/json')

      const contentType = response.getHeader('Content-Type')

      response.flushHeaders()
      res.end(JSON.stringify({ contentType }))
    })

    const { body } = await supertest(server).get('/').expect(200).expect('content-type', 'application/json')
    assert.deepEqual(body, {
      contentType: 'application/json',
    })
  })

  test('append header to existing header', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)

      response.header('set-cookie', 'username=virk')
      response.append('set-cookie', 'age=22')
      response.flushHeaders()
      res.end()
    })

    const { header } = await supertest(server).get('/')
    assert.deepEqual(header['set-cookie'], ['username=virk', 'age=22'])
  })

  test('add header via append when header doesn\'t exists already', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)

      response.append('set-cookie', 'age=22')
      response.flushHeaders()
      res.end()
    })

    const { header } = await supertest(server).get('/')
    assert.deepEqual(header['set-cookie'], ['age=22'])
  })

  test('append to the header value when it\'s an array', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)

      response.append('set-cookie', ['username=virk'])
      response.append('set-cookie', ['age=22'])
      response.flushHeaders()
      res.end()
    })

    const { header } = await supertest(server).get('/')
    assert.deepEqual(header['set-cookie'], ['username=virk', 'age=22'])
  })

  test('do not set header when value is non-existy', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)

      response.header('set-cookie', '')
      response.flushHeaders()
      res.end()
    })

    const { header } = await supertest(server).get('/')
    assert.isUndefined(header['set-cookie'])
  })

  test('do not set header when already exists', async () => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)

      response.header('content-type', 'application/json')
      response.safeHeader('content-type', 'text/html')
      response.flushHeaders()
      res.end()
    })

    await supertest(server).get('/').expect('content-type', 'application/json')
  })

  test('remove existing response header', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)

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
      const config = fakeConfig()
      const response = new Response(req, res, config)

      response.status(201)
      response.flushHeaders()
      res.end()
    })

    await supertest(server).get('/').expect(201)
  })

  test('parse buffer and return correct response header', async () => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)
      const { type, body } = response.buildResponseBody(Buffer.from('hello'))

      response.header('content-type', type)
      response.flushHeaders()
      res.write(body)
      res.end()
    })

    await supertest(server).get('/').expect('content-type', 'application/octet-stream')
  })

  test('parse string and return correct response header', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)
      const { type, body } = response.buildResponseBody('hello')

      response.header('content-type', type)
      response.flushHeaders()
      res.write(body)
      res.end()
    })

    const { text } = await supertest(server).get('/').expect('content-type', 'text/plain')
    assert.equal(text, 'hello')
  })

  test('parse HTML string and return correct response header', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)
      const { type, body } = response.buildResponseBody('<p> hello </p>')
      response.header('content-type', type)
      response.flushHeaders()
      res.write(body)
      res.end()
    })

    const { text } = await supertest(server).get('/').expect('content-type', 'text/html')
    assert.equal(text, '<p> hello </p>')
  })

  test('parse array and set correct response type', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)
      const { type, body } = response.buildResponseBody([1, 2])
      response.header('content-type', type)
      response.flushHeaders()
      res.write(body)
      res.end()
    })

    const { body } = await supertest(server).get('/').expect('content-type', 'application/json')
    assert.deepEqual(body, [1, 2])
  })

  test('parse object and set correct response type', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)
      const { type, body } = response.buildResponseBody({ username: 'virk' })
      response.header('content-type', type)
      response.flushHeaders()
      res.write(body)
      res.end()
    })

    const { body } = await supertest(server).get('/').expect('content-type', 'application/json')
    assert.deepEqual(body, { username: 'virk' })
  })

  test('set content type as null for empty string', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)
      const { type } = response.buildResponseBody('')
      res.write(type)
      res.end()
    })

    const { text } = await supertest(server).get('/')
    assert.deepEqual(text, 'null')
  })

  test('return content type as null for null', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)
      const { type } = response.buildResponseBody(null)
      res.write(type)
      res.end()
    })

    const { text } = await supertest(server).get('/')
    assert.deepEqual(text, 'null')
  })

  test('do not write send body and headers unless finish is called explicitly', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)

      response.send({ username: 'virk' })
      res.write('hello')
      res.end()
    })

    const { text } = await supertest(server).get('/')
    assert.equal(text, 'hello')
  })

  test('write send body and headers when finish is called explicitly', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)
      response.send({ username: 'virk' })
      response.finish()
    })

    const { body } = await supertest(server)
      .get('/')
      .expect('content-type', 'application/json; charset=utf-8')
      .expect('content-length', '19')

    assert.deepEqual(body, { username: 'virk' })
  })

  test('do not write response twice if finish is called twice', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)

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

  test('hasLazyBody must return true after send has been called', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)

      response.json({ username: 'virk' })
      res.end(String(response.hasLazyBody))
    })

    const { text } = await supertest(server).get('/')
    assert.equal(text, 'true')
  })

  test('write jsonp response', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)
      response.jsonp({ username: 'virk' })
      response.finish()
    })

    const { text } = await supertest(server).get('/')

    const body = { username: 'virk' }
    assert.equal(text, `/**/ typeof callback === 'function' && callback(${JSON.stringify(body)});`)
  })

  test('use explicit value for callback name', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)
      response.jsonp({ username: 'virk' }, 'fn')
      response.finish()
    })

    const { text } = await supertest(server).get('/?callback=cb')

    const body = { username: 'virk' }
    assert.equal(text, `/**/ typeof fn === 'function' && fn(${JSON.stringify(body)});`)
  })

  test('use config value when explicit value is not defined and their is no query string', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig({ jsonpCallbackName: 'cb' })
      const response = new Response(req, res, config)
      response.jsonp({ username: 'virk' })
      response.finish()
    })

    const { text } = await supertest(server).get('/')

    const body = { username: 'virk' }
    assert.equal(text, `/**/ typeof cb === 'function' && cb(${JSON.stringify(body)});`)
  })

  test('stream response', async (assert) => {
    await fs.add('hello.txt', 'hello world')

    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)
      response.stream(createReadStream(join(fs.basePath, 'hello.txt')))
      response.finish()
    })

    const { text } = await supertest(server).get('/')
    assert.equal(text, 'hello world')
  })

  test('raise error when we try to stream a non-existing file', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)
      response.stream(createReadStream(join(fs.basePath, 'i-dont-exist.txt')))
      response.finish()
    })

    const { text, status } = await supertest(server).get('/')
    assert.equal(status, 404)
    assert.equal(text, 'File not found')
  })

  test('raise error when input is not a stream', async (assert) => {
    assert.plan(1)

    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)

      const stream = response.stream as any
      const fn = () => stream('hello')
      assert.throw(fn, 'response.stream accepts a readable stream only')
      response.finish()
    })

    await supertest(server).get('/')
  })

  test('raise error when input is a writable stream', async (assert) => {
    assert.plan(1)
    await fs.ensureRoot()

    const server = createServer(async (req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)
      const writeStream = createWriteStream(join(fs.basePath, 'hello.txt'))

      const stream = response.stream as any
      const fn = () => stream(writeStream)
      assert.throw(fn, 'response.stream accepts a readable stream only')
      writeStream.close()
      response.finish()
    })

    await supertest(server).get('/')
  })

  test('should not hit the maxListeners when making more than 10 calls', async () => {
    await fs.add('hello.txt', 'hello world')

    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)
      response.stream(createReadStream(join(fs.basePath, 'hello.txt')))
      response.finish()
    })

    const requests = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(() => supertest(server).get('/').expect(200))
    await Promise.all(requests)
  })

  test('raise error when stream raises one', async (assert) => {
    await fs.add('hello.txt', 'hello world')

    const server = createServer(async (req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)

      const readStream = createReadStream(join(fs.basePath, 'hello.txt'))

      /**
       * Forcing stream to emit error
       */
      readStream._read = function _read () {
        readStream.emit('error', new Error('Missing file'))
      }

      response.stream(readStream, ({ message }) => message)
      response.finish()
    })

    const { text } = await supertest(server).get('/')
    assert.equal(text, 'Missing file')
  })

  test('send stream errors vs raising them', async (assert) => {
    await fs.add('hello.txt', 'hello world')

    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)

      const readStream = createReadStream(join(fs.basePath, 'hello.txt'))

      /**
       * Forcing stream to emit error
       */
      readStream._read = function _read () {
        readStream.emit('error', new Error('Missing file'))
      }

      response.stream(readStream)
      response.finish()
    })

    const { text } = await supertest(server).get('/')
    assert.equal(text, 'Cannot process file')
  })

  test('download file with correct content type', async (assert) => {
    await fs.add('hello.html', '<p> hello world </p>')

    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)
      response.download(join(fs.basePath, 'hello.html'))
      response.finish()
    })

    const { text } = await supertest(server)
      .get('/')
      .expect('content-type', 'text/html; charset=utf-8')
      .expect('content-length', '20')

    assert.equal(text, '<p> hello world </p>')
  })

  test('write errors as response when downloading folder', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)
      response.download(join(fs.basePath))
      response.finish()
    })

    const { text } = await supertest(server).get('/').expect(404)
    assert.equal(text, 'Cannot process file')
  })

  test('write errors as response when file is missing', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)
      response.download(join(fs.basePath, 'hello.html'))
      response.finish()
    })

    const { text } = await supertest(server).get('/').expect(404)
    assert.equal(text, 'Cannot process file')
  })

  test('raise errors as response when file is missing', async (assert) => {
    const server = createServer(async (req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)

      response.download(join(fs.basePath, 'hello.html'), false)
      response.finish()
    })

    const { text } = await supertest(server).get('/').expect(404)
    assert.equal(text, 'Cannot process file')
  })

  test('do not stream file on HEAD calls', async (assert) => {
    await fs.add('hello.html', '<p> hello world </p>')

    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)
      response.download(join(fs.basePath, 'hello.html'))
      response.finish()
    })

    const { text } = await supertest(server).head('/').expect(200)
    assert.isUndefined(text)
  })

  test('do not stream file when cache is fresh', async (assert) => {
    await fs.add('hello.html', '<p> hello world </p>')

    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)
      response.download(join(fs.basePath, 'hello.html'), true)
      response.finish()
    })

    const stats = await fs.fsExtra.stat(join(fs.basePath, 'hello.html'))

    const { text } = await supertest(server)
      .get('/')
      .set('if-none-match', etag(stats, { weak: true }))
      .expect(304)

    assert.equal(text, '')
  })

  test('set HTTP status to 304 when cache is fresh and request is HEAD', async (assert) => {
    await fs.add('hello.html', '<p> hello world </p>')

    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)
      response.download(join(fs.basePath, 'hello.html'), true)
      response.finish()
    })

    const stats = await fs.fsExtra.stat(join(fs.basePath, 'hello.html'))

    const { text } = await supertest(server)
      .head('/')
      .set('if-none-match', etag(stats, { weak: true }))
      .expect(304)

    assert.isUndefined(text)
  })

  test('download file with correct content disposition', async (assert) => {
    await fs.add('hello.html', '<p> hello world </p>')

    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)
      response.attachment(join(fs.basePath, 'hello.html'))
      response.finish()
    })

    const { text } = await supertest(server)
      .get('/')
      .expect('content-type', 'text/html; charset=utf-8')
      .expect('Content-length', '20')
      .expect('Content-Disposition', 'attachment; filename="hello.html"')

    assert.equal(text, '<p> hello world </p>')
  })

  test('download file with custom file name', async (assert) => {
    await fs.add('hello.html', '<p> hello world </p>')

    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)
      response.attachment(join(fs.basePath, 'hello.html'), 'ooo.html')
      response.finish()
    })

    const { text } = await supertest(server)
      .get('/')
      .expect('content-type', 'text/html; charset=utf-8')
      .expect('Content-length', '20')
      .expect('Content-Disposition', 'attachment; filename="ooo.html"')

    assert.equal(text, '<p> hello world </p>')
  })

  test('download file with custom disposition', async (assert) => {
    await fs.add('hello.html', '<p> hello world </p>')

    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)
      response.attachment(join(fs.basePath, 'hello.html'), 'ooo.html', 'inline')
      response.finish()
    })

    const { text } = await supertest(server)
      .get('/')
      .expect('content-type', 'text/html; charset=utf-8')
      .expect('Content-length', '20')
      .expect('Content-Disposition', 'inline; filename="ooo.html"')

    assert.equal(text, '<p> hello world </p>')
  })

  test('redirect to given url', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)
      response.redirect('/foo')
      response.finish()
    })

    const { header } = await supertest(server).get('/').redirects(1)
    assert.equal(header.location, '/foo')
  })

  test('redirect to given url with query string', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)
      response.redirect('/foo', true)
      response.finish()
    })

    const { header } = await supertest(server).get('/?username=virk').redirects(1)
    assert.equal(header.location, '/foo?username=virk')
  })

  test('redirect to given url and set custom statusCode', async () => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)
      response.redirect('/foo', false, 301)
      response.finish()
    })

    await supertest(server).get('/').redirects(1).expect(301)
  })

  test('add multiple vary fields', async () => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)
      response.vary('Origin')
      response.vary('Set-Cookie')
      response.finish()
    })

    await supertest(server).get('/').expect('Vary', 'Origin, Set-Cookie')
  })

  test('set status code to 204 when body is empty', async () => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)
      response.send('')
      response.finish()
    })

    await supertest(server).get('/').expect(204)
  })

  test('do not override explicit status even when body is empty', async () => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)
      response.status(200).send('')
      response.finish()
    })

    await supertest(server).get('/').expect(200)
  })

  test('remove previously set content headers when status code is 304', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)
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
      const config = fakeConfig({
        etag: true,
      })
      const response = new Response(req, res, config)
      response.send({ username: 'virk' })
      response.finish()
    })

    const responseEtag = etag(JSON.stringify({ username: 'virk' }))
    await supertest(server).get('/').expect('Etag', responseEtag)
  })

  test('convert number to string when sending as response', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)
      response.send(22)
      response.finish()
    })

    const { text } = await supertest(server).get('/')
    assert.equal(text, '22')
  })

  test('convert boolean to string when sending as response', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)
      response.send(false)
      response.finish()
    })

    const { text } = await supertest(server).get('/')
    assert.equal(text, 'false')
  })

  test('raise error when return type is not valid', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)

      try {
        response.send(function foo () {})
        response.finish()
      } catch (error) {
        res.write(error.message)
        res.end()
      }
    })

    const { text } = await supertest(server).get('/')
    assert.equal(text, 'Cannot send function as HTTP response')
  })

  test('convert serializable objects to JSON representation', async (assert) => {
    class User {
      public toJSON () {
        return {
          username: 'virk',
        }
      }
    }

    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)
      response.send(new User())
      response.finish()
    })

    const { body } = await supertest(server).get('/')
    assert.deepEqual(body, { username: 'virk' })
  })

  test('send response as 200 when request method is HEAD and cache is not fresh', async (assert) => {
    await fs.add('hello.html', '<p> hello world </p>')

    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)
      response.download(join(fs.basePath, 'hello.html'), true)
      response.finish()
    })

    const { text } = await supertest(server)
      .head('/')
      .set('if-none-match', 'hello')
      .expect(200)

    assert.isUndefined(text)
  })

  test('stream the file when request method is GET and cache is not fresh', async (assert) => {
    await fs.add('hello.html', '<p> hello world </p>')

    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)
      response.download(join(fs.basePath, 'hello.html'), true)
      response.finish()
    })

    const { text } = await supertest(server)
      .get('/')
      .set('if-none-match', 'hello')
      .expect(200)

    assert.equal(text, '<p> hello world </p>')
  })

  test('set response type with custom charset', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)
      response.type('plain/text', 'ascii').send('done')
      response.finish()
    })

    const { text } = await supertest(server)
      .get('/')
      .expect(200)
      .expect('content-type', 'plain/text; charset=ascii')

    assert.equal(text, 'done')
  })

  test('set signed cookie', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)
      response.cookie('name', 'virk').send('done')
      response.finish()
    })

    const { header } = await supertest(server).get('/').expect(200)
    const cookies = header['set-cookie'].map((cookie: string) => {
      const [value, ...options] = cookie.split(';')
      return { value: parse(value, SECRET), options: options.map((option) => option.trim()) }
    })

    assert.deepEqual(cookies, [
      {
        value: {
          signedCookies: { name: 'virk' },
          plainCookies: {},
        },
        options: ['Max-Age=90', 'Path=/', 'HttpOnly'],
      },
    ])
  })

  test('set plain cookie', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)
      response.plainCookie('name', 'virk').send('done')
      response.finish()
    })

    const { header } = await supertest(server).get('/').expect(200)
    const cookies = header['set-cookie'].map((cookie: string) => {
      const [value, ...options] = cookie.split(';')
      return { value: parse(value, SECRET), options: options.map((option) => option.trim()) }
    })

    assert.deepEqual(cookies, [
      {
        value: {
          signedCookies: {},
          plainCookies: { name: 'virk' },
        },
        options: ['Max-Age=90', 'Path=/', 'HttpOnly'],
      },
    ])
  })

  test('set cookie with custom domain', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)
      response.cookie('name', 'virk', { domain: 'foo.com' }).send('done')
      response.finish()
    })

    const { header } = await supertest(server).get('/').expect(200)
    const cookies = header['set-cookie'].map((cookie: string) => {
      const [value, ...options] = cookie.split(';')
      return { value: parse(value, SECRET), options: options.map((option) => option.trim()) }
    })

    assert.deepEqual(cookies, [
      {
        value: {
          signedCookies: { name: 'virk' },
          plainCookies: {},
        },
        options: ['Max-Age=90', 'Domain=foo.com', 'Path=/', 'HttpOnly'],
      },
    ])
  })

  test('clear cookie by setting expiry in fast', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)
      response.clearCookie('name').send('done')
      response.finish()
    })

    const { header } = await supertest(server).get('/').expect(200)
    const cookies = header['set-cookie'].map((cookie: string) => {
      const [value, ...options] = cookie.split(';')
      return { value: parse(value, SECRET), options: options.map((option) => option.trim()) }
    })

    assert.deepEqual(cookies, [
      {
        value: {
          signedCookies: {},
          plainCookies: {},
        },
        options: ['Max-Age=90', 'Path=/', 'Expires=Thu, 01 Jan 1970 00:00:00 GMT', 'HttpOnly'],
      },
    ])
  })

  test('abort request by raising exception', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)
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

  test('abort request with json body', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)
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

  test('abort request with custom status code', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)
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

  test('abortIf: abort request when condition is truthy', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)
      try {
        response.abortIf(true, { message: 'Not allowed' }, 401)
      } catch (error) {
        error.handle(error, { response })
      }

      response.finish()
    })

    const { body } = await supertest(server).get('/').expect(401)
    assert.deepEqual(body, { message: 'Not allowed' })
  })

  test('abortIf: do not abort request when condition is falsy', async () => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, config)
      try {
        response.abortIf(false, { message: 'Not allowed' }, 401)
      } catch (error) {
        error.handle(error, { response })
      }

      response.finish()
    })

    await supertest(server).get('/').expect(200)
  })

  test('abortUnless: abort request when condition is falsy', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response: Response = new Response(req, res, config)
      try {
        response.abortUnless(false, { message: 'Not allowed' }, 401)
      } catch (error) {
        error.handle(error, { response })
      }

      response.finish()
    })

    const { body } = await supertest(server).get('/').expect(401)
    assert.deepEqual(body, { message: 'Not allowed' })
  })

  test('abortUnless: do not abort request when condition is truthy', async () => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response: Response = new Response(req, res, config)
      try {
        response.abortUnless(true, { message: 'Not allowed' }, 401)
      } catch (error) {
        error.handle(error, { response })
      }

      response.finish()
    })

    await supertest(server).get('/').expect(200)
  })
})
