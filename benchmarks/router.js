/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { once } from 'node:events'
import { arch, cpus, platform, release, totalmem } from 'node:os'
import { dirname, join } from 'node:path'
import { fork } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import autocannon from 'autocannon'

const duration = Number(process.env.BENCH_DURATION ?? 10)
const warmupDuration = Number(process.env.BENCH_WARMUP_DURATION ?? 3)
const connections = Number(process.env.BENCH_CONNECTIONS ?? 100)
const pipelining = Number(process.env.BENCH_PIPELINING ?? 10)
const staticRoutes = Number(process.env.BENCH_STATIC_ROUTES ?? 1000)
const dynamicRoutes = Number(process.env.BENCH_DYNAMIC_ROUTES ?? 100)
const outputFile = process.env.BENCH_OUTPUT
const label = process.env.BENCH_LABEL ?? 'unlabeled'

/**
 * Paths spread evenly over the whole table. A scenario built from a single path
 * measures a repeated URL, which any per-URL memoisation answers without ever
 * running the matcher, so these scenarios are the ones that show what real
 * traffic pays.
 */
function spread(count, build) {
  const total = Math.min(count, 25)
  return Array.from({ length: total }, (_, index) => build(Math.floor((index * count) / total)))
}

const variedStatic = spread(staticRoutes, (index) => `/static/${index}`)
const variedDynamic = spread(dynamicRoutes, (index) => `/dynamic/${index}/123`)

const scenarios = [
  { name: 'static-first', paths: ['/static/0'] },
  { name: 'static-last', paths: [`/static/${staticRoutes - 1}`] },
  { name: 'dynamic-first', paths: ['/dynamic/0/123'] },
  { name: 'dynamic-last', paths: [`/dynamic/${dynamicRoutes - 1}/123`] },
  { name: 'alternating-static', paths: ['/static/0', `/static/${staticRoutes - 1}`] },
  { name: 'alternating-dynamic', paths: ['/dynamic/0/123', `/dynamic/${dynamicRoutes - 1}/123`] },
  { name: 'varied-static', paths: variedStatic },
  { name: 'varied-dynamic', paths: variedDynamic },
  { name: 'varied-mixed', paths: variedStatic.flatMap((path, i) => [path, variedDynamic[i % variedDynamic.length]]) },
]

const frameworks = [
  {
    name: 'AdonisJS HTTP Server',
    url: 'http://localhost:4001',
    server: 'router_adonisjs.js',
  },
  { name: 'Fastify', url: 'http://localhost:3001', server: 'router_fastify.js' },
]

function runAutocannon(url, paths, seconds) {
  return new Promise((resolve, reject) => {
    autocannon(
      {
        url,
        connections,
        duration: seconds,
        pipelining,
        requests: paths.map((path) => ({ path })),
      },
      (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve(result)
        }
      }
    )
  })
}

function startServer(file) {
  return new Promise((resolve, reject) => {
    const child = fork(join(import.meta.dirname, file), {
      stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
    })
    child.once('error', reject)
    child.once('exit', (code, signal) => {
      reject(new Error(`${file} exited before becoming ready (${code ?? signal})`))
    })
    child.once('message', () => resolve(child))
  })
}

async function stopServer(child) {
  if (child.exitCode === null) {
    child.kill('SIGINT')
    await once(child, 'exit')
  }
}

async function verifyEndpoints(url) {
  const paths = new Set(scenarios.flatMap((scenario) => scenario.paths))
  for (const path of paths) {
    const response = await fetch(`${url}${path}`)
    if (!response.ok) {
      throw new Error(`${url}${path} returned ${response.status}`)
    }
  }
}

async function runFramework(framework) {
  console.log(`\n${framework.name}`)
  const child = await startServer(framework.server)
  try {
    await verifyEndpoints(framework.url)
    await runAutocannon(
      framework.url,
      scenarios.flatMap((scenario) => scenario.paths),
      warmupDuration
    )

    const results = []
    for (const scenario of scenarios) {
      const result = await runAutocannon(framework.url, scenario.paths, duration)
      if (result.errors || result.timeouts || result.non2xx) {
        throw new Error(
          `${framework.name} ${scenario.name} failed: ${result.errors} errors, ${result.timeouts} timeouts, ${result.non2xx} non-2xx responses`
        )
      }
      results.push({
        framework: framework.name,
        scenario: scenario.name,
        requests: result.requests.average,
        latency: result.latency.average,
      })
      console.log(`${scenario.name}: ${Math.round(result.requests.average).toLocaleString()} req/s`)
    }
    return results
  } finally {
    await stopServer(child)
  }
}

console.log(
  `${staticRoutes} static routes + ${dynamicRoutes} dynamic routes | ${connections} connections | ${pipelining} pipelining | ${duration}s per scenario`
)

const results = []
for (const framework of frameworks) {
  results.push(...(await runFramework(framework)))
}

console.log('\nComparison')
console.table(
  scenarios.map((scenario) => {
    const adonis = results.find(
      (result) =>
        result.framework === 'AdonisJS HTTP Server' && result.scenario === scenario.name
    )
    const fastify = results.find(
      (result) => result.framework === 'Fastify' && result.scenario === scenario.name
    )
    return {
      Scenario: scenario.name,
      'AdonisJS req/s': Math.round(adonis.requests),
      'Fastify req/s': Math.round(fastify.requests),
      'AdonisJS vs Fastify': `${((adonis.requests / fastify.requests - 1) * 100).toFixed(2)}%`,
      'AdonisJS latency': `${adonis.latency.toFixed(2)} ms`,
      'Fastify latency': `${fastify.latency.toFixed(2)} ms`,
    }
  })
)

if (outputFile) {
  await mkdir(dirname(outputFile), { recursive: true })
  await writeFile(
    outputFile,
    `${JSON.stringify(
      {
        label,
        timestamp: new Date().toISOString(),
        environment: {
          cpu: cpus()[0]?.model,
          memory: totalmem(),
          node: process.version,
          platform: `${platform()} ${release()} ${arch()}`,
        },
        configuration: {
          staticRoutes,
          dynamicRoutes,
          connections,
          pipelining,
          duration,
          warmupDuration,
        },
        results,
      },
      null,
      2
    )}\n`
  )
  console.log(`Saved raw results to ${outputFile}`)
}
