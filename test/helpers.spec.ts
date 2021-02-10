/**
 * @adonisjs/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'
import { normalizeMakeUrlOptions, normalizeMakeSignedUrlOptions } from '../src/helpers'

test.group('Helpers | normalizeMakeUrlOptions', () => {
  test('use top level object as params', (assert) => {
    assert.deepEqual(normalizeMakeUrlOptions({ id: 1, qs: { method: '_GET' } }), {
      params: { id: 1, qs: { method: '_GET' } },
      qs: { method: '_GET' },
      domainParams: {},
      prefixDomain: true,
    })
  })

  test('use top params as params when defined explictly', (assert) => {
    assert.deepEqual(normalizeMakeUrlOptions({ params: { id: 1 }, qs: { method: '_GET' } }), {
      params: { id: 1 },
      qs: { method: '_GET' },
      domainParams: {},
      prefixDomain: true,
    })
  })
})

test.group('Helpers | normalizeMakeSignedUrlOptions', () => {
  test('use top level object as params', (assert) => {
    assert.deepEqual(normalizeMakeSignedUrlOptions({ id: 1, qs: { method: '_GET' } }), {
      params: { id: 1, qs: { method: '_GET' } },
      qs: { method: '_GET' },
      domainParams: {},
      prefixDomain: true,
      expiresIn: undefined,
      purpose: undefined,
    })
  })

  test('use top params as params when defined explictly', (assert) => {
    assert.deepEqual(normalizeMakeSignedUrlOptions({ params: { id: 1 }, qs: { method: '_GET' } }), {
      params: { id: 1 },
      qs: { method: '_GET' },
      domainParams: {},
      prefixDomain: true,
      expiresIn: undefined,
      purpose: undefined,
    })
  })

  test('return expiresIn value when defined', (assert) => {
    assert.deepEqual(normalizeMakeSignedUrlOptions({ id: 1, expiresIn: '1min' }), {
      params: { id: 1, expiresIn: '1min' },
      qs: {},
      domainParams: {},
      prefixDomain: true,
      expiresIn: '1min',
      purpose: undefined,
    })
  })

  test('return purpose value when defined', (assert) => {
    assert.deepEqual(normalizeMakeSignedUrlOptions({ id: 1, purpose: 'login' }), {
      params: { id: 1, purpose: 'login' },
      qs: {},
      domainParams: {},
      prefixDomain: true,
      expiresIn: undefined,
      purpose: 'login',
    })
  })
})
