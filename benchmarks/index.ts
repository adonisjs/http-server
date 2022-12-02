/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'node:path'
import { fork } from 'node:child_process'
// @ts-expect-error
import autocannon from 'autocannon'
import { getDirname } from '@poppinss/utils'

function coolOff() {
  return new Promise((resolve) => setTimeout(resolve, 5000))
}

function autocannonRun(opts: any): Promise<void> {
  return new Promise((resolve) => {
    const instance = autocannon(opts, () => {
      resolve()
    })
    autocannon.track(instance)
  })
}

async function adonisRun() {
  console.log('ADONIS')
  const forked = fork(join(getDirname(import.meta.url), 'adonisjs.js'))

  await coolOff()
  await autocannonRun({
    url: 'http://localhost:4000',
    connections: 100,
    duration: 40,
    pipelining: 10,
  })

  await autocannonRun({
    url: 'http://localhost:4000',
    connections: 100,
    duration: 40,
    pipelining: 10,
  })

  forked.kill('SIGINT')
  console.log('Completed')
}

async function fastifyRun() {
  console.log('FASTIFY')
  const forked = fork(join(getDirname(import.meta.url), 'fastify.js'))

  await coolOff()
  await autocannonRun({
    url: 'http://localhost:3000',
    connections: 100,
    duration: 40,
    pipelining: 10,
  })

  await autocannonRun({
    url: 'http://localhost:3000',
    connections: 100,
    duration: 40,
    pipelining: 10,
  })

  forked.kill('SIGINT')
  console.log('Completed')
}

fastifyRun().then(coolOff).then(adonisRun)
