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
      prefixUrl: undefined,
      domain: undefined,
    })
  })

  test('use top level params as params when defined explictly', (assert) => {
    assert.deepEqual(normalizeMakeUrlOptions({ params: { id: 1 }, qs: { method: '_GET' } }), {
      params: { id: 1 },
      qs: { method: '_GET' },
      prefixUrl: undefined,
      domain: undefined,
    })
  })

  test('use qs from the options object', (assert) => {
    assert.deepEqual(
      normalizeMakeUrlOptions(
        { params: { id: 1 }, qs: { method: '_GET' } },
        { qs: { method: 'POST' } }
      ),
      {
        params: { id: 1 },
        qs: { method: 'POST' },
        prefixUrl: undefined,
        domain: undefined,
      }
    )
  })

  test('use params when defined as an array', (assert) => {
    assert.deepEqual(normalizeMakeUrlOptions([1], { qs: { method: 'POST' } }), {
      params: [1],
      qs: { method: 'POST' },
      prefixUrl: undefined,
      domain: undefined,
    })
  })
})

test.group('Helpers | normalizeMakeSignedUrlOptions', () => {
  test('use top level object as params', (assert) => {
    assert.deepEqual(normalizeMakeSignedUrlOptions({ id: 1, qs: { method: '_GET' } }), {
      params: { id: 1, qs: { method: '_GET' } },
      qs: { method: '_GET' },
      expiresIn: undefined,
      purpose: undefined,
      prefixUrl: undefined,
      domain: undefined,
    })
  })

  test('use top params as params when defined explictly', (assert) => {
    assert.deepEqual(normalizeMakeSignedUrlOptions({ params: { id: 1 }, qs: { method: '_GET' } }), {
      params: { id: 1 },
      qs: { method: '_GET' },
      expiresIn: undefined,
      purpose: undefined,
      prefixUrl: undefined,
      domain: undefined,
    })
  })

  test('return expiresIn value when defined', (assert) => {
    assert.deepEqual(normalizeMakeSignedUrlOptions({ id: 1, expiresIn: '1min' }), {
      params: { id: 1, expiresIn: '1min' },
      qs: undefined,
      expiresIn: '1min',
      purpose: undefined,
      prefixUrl: undefined,
      domain: undefined,
    })
  })

  test('return purpose value when defined', (assert) => {
    assert.deepEqual(normalizeMakeSignedUrlOptions({ id: 1, purpose: 'login' }), {
      params: { id: 1, purpose: 'login' },
      qs: undefined,
      expiresIn: undefined,
      purpose: 'login',
      prefixUrl: undefined,
      domain: undefined,
    })
  })

  test('use qs from the options object', (assert) => {
    assert.deepEqual(
      normalizeMakeSignedUrlOptions(
        { params: { id: 1 }, qs: { method: '_GET' } },
        { qs: { method: 'POST' } }
      ),
      {
        params: { id: 1 },
        qs: { method: 'POST' },
        expiresIn: undefined,
        purpose: undefined,
        prefixUrl: undefined,
        domain: undefined,
      }
    )
  })

  test('use params when defined as an array', (assert) => {
    assert.deepEqual(normalizeMakeSignedUrlOptions([1], { qs: { method: 'POST' } }), {
      params: [1],
      qs: { method: 'POST' },
      expiresIn: undefined,
      purpose: undefined,
      prefixUrl: undefined,
      domain: undefined,
    })
  })
})
