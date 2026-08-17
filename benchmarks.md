# Benchmarks

The benchmark scheme is taken from the Fastify GitHub repository except that we intall [@fastify/middie](https://github.com/fastify/middie), their middleware engine, to be closer to the reality.

- **Machine**: MacBook Pro (M1 Pro) 32GB RAM
- **Method**: autocannon -c 100 -d 40 -p 10 localhost:3000 * 2, taking the second average

| Framework                 | Version                    | Router?      |  Requests/sec  |
| :-----------------        | :------------------------- | :----------: | -------------: |
| **Fastify**               | **4.28.1**                 | **&#10003;** | **111,985.6**    |
| **AdonisJS Http Server**  | **7.2.4**                  | **&#10003;** | **101,992**    |

You can run the same benchmarks by cloning the repo and then running the following command.

```sh
npm run benchmark
```

This workload measures the complete HTTP request pipeline with one static `GET /` route. It does not measure how routing performance changes with route count or alternating URLs.

## Router benchmark

The router benchmark registers 1,000 static routes and 100 dynamic routes in both AdonisJS HTTP Server and Fastify. It measures the first and last static and dynamic routes, alternating static and dynamic URLs, and URLs spread over the whole table.

```sh
npm run benchmark:router
```

Each scenario runs for 10 seconds after a shared warmup. The workload can be adjusted with `BENCH_DURATION`, `BENCH_WARMUP_DURATION`, `BENCH_CONNECTIONS`, `BENCH_PIPELINING`, `BENCH_STATIC_ROUTES`, and `BENCH_DYNAMIC_ROUTES`. Set `BENCH_OUTPUT` to save the raw results as JSON and `BENCH_LABEL` to identify the run.

`BENCH_SHAPE` selects how the route table is built. `uniform` (the default) declares every static route before any dynamic one and has no catch-all. `app` mirrors how routes accumulate in a real application: a dynamic route appears early among the static ones, and a top level param route plus a catch-all close the file. Route matching is sensitive to both, so a router change should be measured against each.

```sh
BENCH_SHAPE=app BENCH_STATIC_ROUTES=60 BENCH_DYNAMIC_ROUTES=20 npm run benchmark:router
```

Scenarios built from a single path measure a repeated URL, which per-URL memoisation answers without running the matcher. The `varied-*` scenarios spread requests across the table and are the ones that reflect mixed traffic.

`BENCH_MIDDLEWARE_COUNT` registers that many middleware in both servers, and `BENCH_MIDDLEWARE_KIND` chooses what they do. The default middleware returns `next()` and nothing else, which measures the machinery around it rather than a realistic request. `realistic` awaits, reads a header and allocates, which is still less work than session, auth or CSRF middleware perform. Anything measuring per-middleware overhead should be reported against `realistic`.

```sh
BENCH_MIDDLEWARE_COUNT=6 BENCH_MIDDLEWARE_KIND=realistic npm run benchmark:router
```

See the [recorded before-and-after results](benchmarks/results/router-comparison.md) for both table shapes.

Since the program correctness and reliability is more important over micro optimizations. We pay penalty on following fronts in comparison to Fastify.

- **The AdonisJS query string parser can parse arrays inside the query string** `(/api?foo[]=bar&foo[]=fuzz&foo[]=buzz
)`, wherease fastify doesn't parse it by default for performance reasons. However, you can also define your own query string parser with fastify, but again, you will end up paying the same performance penalty.
- **Subdomain based routing** is another front, where AdonisJS has to perform little bit extra work to find the correct route and it's handler by matching the domains first.
