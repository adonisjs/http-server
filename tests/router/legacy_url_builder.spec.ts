/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { AppFactory } from '@adonisjs/application/factories'
import { EncryptionFactory } from '@adonisjs/encryption/factories'

import { Router } from '../../src/router/main.ts'
import { HttpRequestFactory } from '../../factories/request.ts'
import { QsParserFactory } from '../../factories/qs_parser_factory.ts'

const BASE_URL = new URL('./app/', import.meta.url)

test.group('Legacy URL builder', () => {
  test('create url for a route', ({ assert }) => {
    const app = new AppFactory().create(BASE_URL, () => {})
    const encryption = new EncryptionFactory().create()
    const router = new Router(app, encryption, new QsParserFactory().create())

    router.route('/users/:id', ['GET'], () => {})
    router.commit()
    assert.equal(router.builder().params([1]).make('/users/:id'), '/users/1')
  })

  test('create url for a route by its name', ({ assert }) => {
    const app = new AppFactory().create(BASE_URL, () => {})
    const encryption = new EncryptionFactory().create()
    const router = new Router(app, encryption, new QsParserFactory().create())

    router.route('/users/:id', ['GET'], () => {}).as('users.show')
    router.commit()
    assert.equal(router.builder().params([1]).make('users.show'), '/users/1')
  })

  test('create url for a route by its name for the home path', ({ assert }) => {
    const app = new AppFactory().create(BASE_URL, () => {})
    const encryption = new EncryptionFactory().create()
    const router = new Router(app, encryption, new QsParserFactory().create())

    router.route('/', ['GET'], () => {}).as('home')
    router.commit()
    assert.equal(router.builder().make('home'), '/')
  })

  test('create url for a route by the handler name', ({ assert }) => {
    const app = new AppFactory().create(BASE_URL, () => {})
    const encryption = new EncryptionFactory().create()
    const router = new Router(app, encryption, new QsParserFactory().create())

    router.route('/users/:id', ['GET'], '#controllers/posts')
    router.commit()
    assert.equal(router.builder().params([1]).make('#controllers/posts'), '/users/1')
  })

  test('create url for a route by the handler name for the home path', ({ assert }) => {
    const app = new AppFactory().create(BASE_URL, () => {})
    const encryption = new EncryptionFactory().create()
    const router = new Router(app, encryption, new QsParserFactory().create())

    router.route('/', ['GET'], '#controllers/home')
    router.commit()
    assert.equal(router.builder().params([1]).make('#controllers/home'), '/')
  })

  test('raise error when unable to lookup route', ({ assert }) => {
    const app = new AppFactory().create(BASE_URL, () => {})
    const encryption = new EncryptionFactory().create()
    const router = new Router(app, encryption, new QsParserFactory().create())

    assert.throws(() => router.builder().make('/users/:id'), 'Cannot lookup route "/users/:id"')
  })

  test('create url without performing route lookup', ({ assert }) => {
    const app = new AppFactory().create(BASE_URL, () => {})
    const encryption = new EncryptionFactory().create()
    const router = new Router(app, encryption, new QsParserFactory().create())

    assert.equal(router.builder().params([1]).disableRouteLookup().make('/users/:id'), '/users/1')
  })

  test('define params as an object', ({ assert }) => {
    const app = new AppFactory().create(BASE_URL, () => {})
    const encryption = new EncryptionFactory().create()
    const router = new Router(app, encryption, new QsParserFactory().create())

    assert.equal(
      router.builder().params({ id: 1 }).disableRouteLookup().make('/users/:id'),
      '/users/1'
    )
  })

  test('do not overwrite existing params when undefined params are shared', ({ assert }) => {
    const encryption = new EncryptionFactory().create()
    const app = new AppFactory().create(BASE_URL, () => {})
    const router = new Router(app, encryption, new QsParserFactory().create())

    assert.equal(
      router.builder().params({ id: 1 }).params().disableRouteLookup().make('/users/:id'),
      '/users/1'
    )
  })

  test('raise error when one or params are missing', ({ assert }) => {
    const encryption = new EncryptionFactory().create()
    const app = new AppFactory().create(BASE_URL, () => {})
    const router = new Router(app, encryption, new QsParserFactory().create())

    assert.throws(
      () => router.builder().disableRouteLookup().make('/users/:id'),
      'Cannot make URL for "/users/:id". Missing value for the "id" param'
    )
  })

  test('allow missing params when param is optional', ({ assert }) => {
    const encryption = new EncryptionFactory().create()
    const app = new AppFactory().create(BASE_URL, () => {})
    const router = new Router(app, encryption, new QsParserFactory().create())

    assert.equal(router.builder().disableRouteLookup().make('/users/:id?'), '/users')
  })

  test('make route with wildcard params', ({ assert }) => {
    const encryption = new EncryptionFactory().create()
    const app = new AppFactory().create(BASE_URL, () => {})
    const router = new Router(app, encryption, new QsParserFactory().create())

    assert.equal(
      router.builder().disableRouteLookup().params([1, 2, 3]).make('/users/*'),
      '/users/1/2/3'
    )
  })

  test('define wildcard param as an object', ({ assert }) => {
    const encryption = new EncryptionFactory().create()
    const app = new AppFactory().create(BASE_URL, () => {})
    const router = new Router(app, encryption, new QsParserFactory().create())

    assert.equal(
      router
        .builder()
        .disableRouteLookup()
        .params({
          '*': [1, 2, 3],
        })
        .make('/users/*'),
      '/users/1/2/3'
    )
  })

  test('raise error when wildcard params are missing', ({ assert }) => {
    const encryption = new EncryptionFactory().create()
    const app = new AppFactory().create(BASE_URL, () => {})
    const router = new Router(app, encryption, new QsParserFactory().create())

    assert.throws(
      () => router.builder().disableRouteLookup().params([]).make('/users/*'),
      'Cannot make URL for "/users/*". Invalid value provided for the wildcard param'
    )
  })

  test('prefix url', ({ assert }) => {
    const encryption = new EncryptionFactory().create()
    const app = new AppFactory().create(BASE_URL, () => {})
    const router = new Router(app, encryption, new QsParserFactory().create())

    assert.equal(
      router.builder().disableRouteLookup().prefixUrl('https://adonisjs.com').make('/users'),
      'https://adonisjs.com/users'
    )
  })

  test('define query string with arrays', ({ assert }) => {
    const encryption = new EncryptionFactory().create()
    const app = new AppFactory().create(BASE_URL, () => {})
    const router = new Router(app, encryption, new QsParserFactory().create())

    assert.equal(
      router
        .builder()
        .disableRouteLookup()
        .qs({
          sort: 'id',
          fields: ['username', 'email'],
        })
        .make('/users'),
      '/users?sort=id&fields%5B0%5D=username&fields%5B1%5D=email'
    )
  })

  test('create and verify signed URLs', async ({ assert }) => {
    const encryption = new EncryptionFactory().create()
    const app = new AppFactory().create(BASE_URL, () => {})
    const router = new Router(app, encryption, new QsParserFactory().create())

    const signedUrl = router.builder().disableRouteLookup().makeSigned('/users')

    const request = new HttpRequestFactory()
      .merge({
        encryption,
        url: signedUrl,
      })
      .create()

    assert.isTrue(request.hasValidSignature())
  })

  test('create and verify signed URLs with query string', async ({ assert }) => {
    const encryption = new EncryptionFactory().create()
    const app = new AppFactory().create(BASE_URL, () => {})
    const router = new Router(app, encryption, new QsParserFactory().create())

    const signedUrl = router
      .builder()
      .disableRouteLookup()
      .qs({
        sort: 'id',
        fields: ['username', 'email'],
      })
      .makeSigned('/users')

    const request = new HttpRequestFactory()
      .merge({
        encryption,
        url: signedUrl,
      })
      .create()

    assert.isTrue(request.hasValidSignature())
  })

  test('build route with params and extension', ({ assert }) => {
    const app = new AppFactory().create(BASE_URL, () => {})
    const encryption = new EncryptionFactory().create()
    const router = new Router(app, encryption, new QsParserFactory().create())

    router.get('/users/:slug.html', () => {}).as('users.show')
    router.commit()
    assert.equal(router.builder().params({ slug: 'foo' }).make('users.show'), '/users/foo.html')
  })
})
