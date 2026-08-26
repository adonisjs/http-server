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
import { RouteTable, extractRouteParams } from '../../src/router/route_table.ts'
import type { RouteMatchers } from '../../src/types/route.ts'

type RouteDefinition = {
  matchers?: RouteMatchers
  pattern: string
}

/**
 * Compatibility vectors copied from the complete upstream test suites:
 * https://github.com/lukeed/matchit/blob/master/test/index.js
 * https://github.com/poppinss/matchit/blob/master/test/index.js
 */
function matchWithMatchit(
  pathname: string,
  definitions: RouteDefinition[],
  shouldDecodeParams: boolean = false
) {
  const tokenLists = definitions.map(({ pattern, matchers }) => matchit.parse(pattern, matchers))
  const matchedTokens = matchit.match(pathname, tokenLists)
  if (!matchedTokens.length) {
    return null
  }

  return {
    params: matchit.exec(pathname, matchedTokens, shouldDecodeParams),
    pattern: matchedTokens[0].old,
  }
}

function matchWithRouteTable(
  pathname: string,
  definitions: RouteDefinition[],
  shouldDecodeParams: boolean = false
) {
  const table = new RouteTable<string>()
  for (const { pattern, matchers } of definitions) {
    table.add(parseRoute(pattern, matchers), pattern)
  }

  const match = table.match(pathname, shouldDecodeParams)
  return match ? { params: match.params, pattern: match.value } : null
}

test.group('Route table | matchit upstream compatibility', () => {
  test('parse every pattern from the upstream suites', ({ assert }) => {
    const patterns = [
      '',
      '/',
      '/about',
      'contact',
      '/foobar',
      '/:foo',
      'books/:title',
      '/foo/:bar',
      '/:foo.bar',
      'books/:title.jpg',
      '/foo/:bar.html',
      '/foo/:bar/:baz',
      '/foo/bar/:baz',
      '/foo/bar/:baz/:bat',
      '/:foo?',
      'foo/:bar?',
      '/foo/:bar?/:baz?',
      '*',
      '/*',
      'foo/*',
      'foo/bar/*',
    ]

    for (const pattern of patterns) {
      assert.deepEqual(parseRoute(pattern), matchit.parse(pattern), pattern)
    }
  })

  test('match every pathname from the inherited lukeed suite', ({ assert }) => {
    const definitions = [
      '/',
      '/about',
      'contact',
      '/books',
      '/books/:title',
      '/foo/*',
      'bar/:baz/:bat?',
      '/videos/:title.mp4',
    ].map((pattern) => ({ pattern }))
    const cases = [
      { pathname: '/', expected: '/' },
      { pathname: '/about', expected: '/about' },
      { pathname: 'contact', expected: 'contact' },
      { pathname: 'about', expected: '/about' },
      { pathname: '/contact', expected: 'contact' },
      { pathname: '/books/', expected: '/books' },
      { pathname: '/books/foobar', expected: '/books/:title' },
      { pathname: '/books/foo/bar', expected: null },
      { pathname: '/hello/world', expected: null },
      { pathname: '/videos/buckbunny.mp4', expected: '/videos/:title.mp4' },
      { pathname: '/videos/buckbunny', expected: null },
      { pathname: '/bar/hello', expected: 'bar/:baz/:bat?' },
      { pathname: '/bar/hello/world', expected: 'bar/:baz/:bat?' },
      { pathname: '/books/narnia?author=lukeed', expected: '/books/:title' },
      { pathname: '/foo/bar', expected: '/foo/*' },
      { pathname: '/foo/bar/baz', expected: '/foo/*' },
    ]

    for (const { pathname, expected } of cases) {
      const oracle = matchWithMatchit(pathname, definitions)
      const actual = matchWithRouteTable(pathname, definitions)
      assert.equal(actual?.pattern ?? null, expected, pathname)
      assert.deepEqual(actual, oracle, pathname)
    }
  })

  test('preserve every root and segment cardinality case', ({ assert }) => {
    const cases = [
      { patterns: ['/'], pathname: '/', expected: '/' },
      { patterns: ['/:title'], pathname: '/', expected: null },
      { patterns: ['/:title'], pathname: '/narnia', expected: '/:title' },
      { patterns: ['/:title?'], pathname: '/', expected: '/:title?' },
      { patterns: ['*'], pathname: '/', expected: '*' },
      { patterns: ['/x', '*'], pathname: '/', expected: '*' },
      { patterns: ['*', '/x'], pathname: '/', expected: '*' },
      { patterns: ['/books/:title'], pathname: '/books', expected: null },
      { patterns: ['/books'], pathname: '/books/123', expected: null },
    ]

    for (const { patterns, pathname, expected } of cases) {
      const definitions = patterns.map((pattern) => ({ pattern }))
      const oracle = matchWithMatchit(pathname, definitions)
      const actual = matchWithRouteTable(pathname, definitions)
      assert.equal(actual?.pattern ?? null, expected, JSON.stringify({ patterns, pathname }))
      assert.deepEqual(actual, oracle, JSON.stringify({ patterns, pathname }))
    }
  })

  test('extract params for every inherited exec case', ({ assert }) => {
    const cases = [
      { pattern: '/', pathname: '/', expected: {} },
      { pattern: '/:type?', pathname: '/', expected: {} },
      { pattern: '/:type?', pathname: '/news', expected: { type: 'news' } },
      { pattern: '/about', pathname: '/about', expected: {} },
      { pattern: 'contact', pathname: '/contact', expected: {} },
      { pattern: '/books/:title', pathname: '/books/foo', expected: { title: 'foo' } },
      {
        pattern: '/videos/:title.mp4',
        pathname: '/videos/foo.mp4',
        expected: { title: 'foo' },
      },
      {
        pattern: '/foo/:bar/:baz',
        pathname: '/foo/hello/world',
        expected: { bar: 'hello', baz: 'world' },
      },
      {
        pattern: 'bar/:baz/:bat?',
        pathname: '/bar/hello',
        expected: { baz: 'hello' },
      },
      {
        pattern: 'bar/:baz/:bat?',
        pathname: '/bar/hello/world',
        expected: { baz: 'hello', bat: 'world' },
      },
      {
        pattern: '/books/:title',
        pathname: '/books/foo?author=lukeed',
        expected: { title: 'foo?author=lukeed' },
      },
      { pattern: '/', pathname: 'foo', expected: {} },
    ]

    for (const { pattern, pathname, expected } of cases) {
      const oracleTokens = matchit.parse(pattern)
      const actual = extractRouteParams(parseRoute(pattern), pathname, false)
      assert.deepEqual(actual, expected, JSON.stringify({ pattern, pathname }))
      assert.deepEqual(actual, matchit.exec(pathname, oracleTokens), pattern)
    }
  })

  test('preserve every poppinss matcher case', ({ assert }) => {
    const alphaMatcher = { bar: { match: /[a-z]+/ } }
    const optionalNumberMatcher = { bar: { match: /^[0-9]+$/ } }
    const cases: {
      definitions: RouteDefinition[]
      expected: string | null
      pathname: string
    }[] = [
      {
        definitions: [{ pattern: '/foo/:bar', matchers: alphaMatcher }],
        pathname: '/foo/1',
        expected: null,
      },
      {
        definitions: [{ pattern: '/foo/:bar', matchers: alphaMatcher }],
        pathname: '/foo/bar',
        expected: '/foo/:bar',
      },
      {
        definitions: [{ pattern: '/foo/:bar', matchers: alphaMatcher }],
        pathname: '/foo/',
        expected: null,
      },
      {
        definitions: [{ pattern: '/foo/:bar', matchers: alphaMatcher }],
        pathname: '/foo',
        expected: null,
      },
      {
        definitions: [{ pattern: '/foo/:bar?', matchers: optionalNumberMatcher }],
        pathname: '/foo',
        expected: '/foo/:bar?',
      },
      {
        definitions: [{ pattern: '/foo/:bar?', matchers: optionalNumberMatcher }],
        pathname: '/foo/1',
        expected: '/foo/:bar?',
      },
      {
        definitions: [{ pattern: '/foo/:bar?', matchers: optionalNumberMatcher }],
        pathname: '/foo/',
        expected: '/foo/:bar?',
      },
      {
        definitions: [
          { pattern: '/foo/:bar?', matchers: alphaMatcher },
          { pattern: '/foo/:id?', matchers: optionalNumberMatcher },
        ],
        pathname: '/foo/1',
        expected: '/foo/:id?',
      },
      {
        definitions: [{ pattern: '/foo/:bar/baz', matchers: alphaMatcher }],
        pathname: '/foo/bar/baz',
        expected: '/foo/:bar/baz',
      },
      {
        definitions: [{ pattern: '/foo/:bar/baz', matchers: alphaMatcher }],
        pathname: '/foo//baz',
        expected: null,
      },
      {
        definitions: [{ pattern: '/foo/:bar/baz' }],
        pathname: '/foo/bar/baz',
        expected: '/foo/:bar/baz',
      },
      {
        definitions: [{ pattern: '/foo/:bar/baz' }],
        pathname: '/foo//baz',
        expected: '/foo/:bar/baz',
      },
    ]

    for (const { definitions, pathname, expected } of cases) {
      const oracle = matchWithMatchit(pathname, definitions)
      const actual = matchWithRouteTable(pathname, definitions)
      assert.equal(actual?.pattern ?? null, expected, JSON.stringify({ definitions, pathname }))
      assert.deepEqual(actual, oracle, JSON.stringify({ definitions, pathname }))
    }
  })

  test('preserve poppinss wildcard, cast, and decoding extensions', ({ assert }) => {
    const cases: {
      decode?: boolean
      expected: Record<string, any>
      matchers?: RouteMatchers
      pathname: string
      pattern: string
    }[] = [
      {
        pattern: '/foo/*',
        pathname: '/foo/bar/baz',
        expected: { '*': ['bar', 'baz'] },
      },
      {
        pattern: '/foo/:bar',
        pathname: '/foo/1',
        matchers: { bar: { match: /^[0-9]+$/, cast: Number } },
        expected: { bar: 1 },
      },
      {
        pattern: '/foo/:bar?',
        pathname: '/foo',
        matchers: { bar: { match: /^[0-9]+$/, cast: Number } },
        expected: {},
      },
      {
        pattern: '/foo/:bar/:baz',
        pathname: '/foo/1/hello',
        matchers: {
          bar: { match: /^[0-9]+$/, cast: Number },
          baz: { cast: (value) => value.toUpperCase() },
        },
        expected: { bar: 1, baz: 'HELLO' },
      },
      {
        pattern: '/foo/:bar',
        pathname: '/foo/fran%C3%A7ais',
        decode: true,
        expected: { bar: 'français' },
      },
      {
        pattern: '/foo/:bar?',
        pathname: '/foo/fran%C3%A7ais',
        decode: true,
        expected: { bar: 'français' },
      },
      {
        pattern: '/foo/*',
        pathname: '/foo/fran%C3%A7ais',
        decode: true,
        expected: { '*': ['français'] },
      },
    ]

    for (const { pattern, pathname, matchers, decode = false, expected } of cases) {
      const definitions = [{ pattern, matchers }]
      const oracle = matchWithMatchit(pathname, definitions, decode)
      const actual = matchWithRouteTable(pathname, definitions, decode)
      assert.deepEqual(actual?.params, expected, JSON.stringify({ pattern, pathname }))
      assert.deepEqual(actual, oracle, JSON.stringify({ pattern, pathname }))
    }
  })
})
