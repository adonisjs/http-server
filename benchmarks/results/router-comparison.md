# Router benchmark comparison

The existing `npm run benchmark` workload is an end-to-end HTTP benchmark with one static `GET /` route. It is useful for measuring the complete request pipeline, but it is not a router scalability benchmark: the matcher always checks the first and only route, using the same URL on every request.

The `npm run benchmark:router` workload registers many routes and measures first, last, alternating and varied URLs, so route count, declaration order and cache locality are all visible.

## Environment

- CPU: Apple M4
- Memory: 32 GiB
- OS: Darwin 24.6.0 arm64
- Node.js: 24.19.0
- Connections: 100
- Pipelining: 10
- Warmup: 3 seconds per framework
- Measurement: 10 seconds per scenario
- Baseline: `9.x` at `9088623`, with this branch's benchmark workload applied on top
- Optimized: this branch

Fastify runs in every measurement as a control. Its numbers are reported next to each table so machine drift between runs stays visible.

## Two route table shapes

The route table is generated in one of two shapes, selected with `BENCH_SHAPE`.

`uniform` (the default) declares every static route before any dynamic one and has no catch-all. `app` mirrors how routes accumulate in a real application: a dynamic route appears early among the static ones, and a top level param route plus a catch-all close the file. Both shapes resolve the benchmark URLs to the same routes, because the trailing routes only capture URLs nothing else matches.

The shape matters. Declaration order decides whether static routes can be indexed for exact lookup, and a top level param or catch-all route is a candidate for every URL.

## Scenarios

Scenarios built from a single path measure a repeated URL, which any per-URL memoisation answers without running the matcher at all. The `varied-*` scenarios spread requests over 25 paths across the whole table and are the ones that reflect what mixed traffic pays.

## Large table, uniform shape

1,000 static routes and 100 dynamic routes.

| Scenario | before | after | Change | Fastify before | Fastify after |
| --- | ---: | ---: | ---: | ---: | ---: |
| static-first | 146,531 | 152,943 | +4.38% | 115,500 | 115,924 |
| static-last | 51,492 | 153,769 | +198.63% | 115,203 | 115,348 |
| dynamic-first | 95,031 | 149,021 | +56.81% | 113,952 | 115,488 |
| dynamic-last | 84,518 | 148,567 | +75.78% | 115,418 | 114,697 |
| alternating-static | 74,272 | 151,535 | +104.03% | 114,784 | 114,714 |
| alternating-dynamic | 88,881 | 140,119 | +57.65% | 114,447 | 114,877 |
| varied-static | 77,501 | 151,383 | +95.33% | 113,597 | 114,202 |
| varied-dynamic | 89,318 | 137,559 | +54.01% | 114,522 | 114,220 |
| varied-mixed | 81,667 | 142,900 | +74.98% | 113,760 | 114,185 |

The control moved by 0.4% on average, so these differences are not machine drift. Throughput no longer depends on where a route sits in the table.

## Small table, app shape

60 static routes, 20 dynamic routes, one dynamic route declared early, and a top level param route plus a catch-all at the end: 83 GET routes in total. This is the size and shape of a typical application, and it is the case the earlier revision of this branch regressed.

The middle column is an intermediate revision measured while developing this branch: the static prefix index alone, before static routes were indexed independently of declaration order and before the routes without a static prefix were merged into the groups. It is included because it is what the original workload failed to catch.

| Scenario | before | prefix index only | after |
| --- | ---: | ---: | ---: |
| static-first | 148,090 | 153,152 | 153,263 |
| static-last | 134,057 | 152,838 | 153,653 |
| dynamic-first | 141,527 | 148,916 | 148,853 |
| dynamic-last | 136,966 | 148,753 | 148,992 |
| alternating-static | 139,665 | 145,123 | 152,454 |
| alternating-dynamic | 138,164 | 135,104 | 140,649 |
| varied-static | 140,596 | 139,537 | 151,732 |
| varied-dynamic | 139,072 | 133,184 | 138,787 |
| varied-mixed | 138,816 | 135,360 | 144,024 |

| | before | prefix index only | after |
| --- | ---: | ---: | ---: |
| Fastify control, average | 113,088 | 113,760 | 114,986 |

The `after` column averages two runs. Repeated runs of the same revision varied by 0.8%, and the control drifted by 1.7% between the `before` and `after` runs, so differences below roughly 2% are not meaningful here.

Against that noise floor:

- `varied-static` and `varied-mixed` were flat or slower with the prefix index alone and are now 7.9% and 3.8% faster. The exact lookup for static routes is what moved them, and it only applies once static routes are indexed regardless of where they are declared.
- `alternating-dynamic` and `varied-dynamic` were 2.2% and 4.2% slower with the prefix index alone. They are back at parity. Both alternate or spread URLs, so the last-match memo never answers them and every request went through the merge and sort that the prefix index used to perform.
- The single-path scenarios are unchanged between the middle and last column: the memo answers them, so they never exercise the matcher.

At this table size a plain scan over every route is already cheap, which is why the store falls back to it below `SMALL_TABLE_ROUTES` routes per domain and method.

## What produces the difference

- **Exact lookup for static routes.** A static route joins a hash table keyed by its pattern unless an earlier route matches it. Registration order does not decide whether the table is populated, only actual shadowing does.
- **Static prefix narrowing.** Routes are grouped by their leading static segments. A request consults only the groups whose prefix its URL starts with. Groups also carry the routes that have no static prefix, so a catch-all does not force a second pass.
- **Registration order is preserved.** Each group is matched on its own and the winner with the lowest registration index wins, which selects the same route as matching the whole table in order. Regex matchers, casts, optional parameters and wildcards keep working unchanged.
- **Small tables skip the index.** Slicing the path at every segment boundary costs more than scanning a short table, so the index is only consulted past `SMALL_TABLE_ROUTES` routes.

## Raw results

- [`router-large-before.json`](./router-large-before.json)
- [`router-large-after.json`](./router-large-after.json)
- [`router-app-before.json`](./router-app-before.json)
- [`router-app-prefix-index-only.json`](./router-app-prefix-index-only.json)
- [`router-app-after-1.json`](./router-app-after-1.json)
- [`router-app-after-2.json`](./router-app-after-2.json)

## Tracing fast path

Every request handler, middleware, response serialization and error handler ran inside a `diagnostics_channel` tracing wrapper, whether or not anything was subscribed to those channels. The wrapper allocates a context object, publishes to the start channel, attaches promise continuations and publishes again on settle. With no subscriber that work is thrown away.

The fast path calls the target directly when the channel reports no subscribers, and leaves the traced path untouched otherwise. `hasSubscribers` was already read on every one of those calls to decide the context argument, so the check itself is not new.

### Method

Measured with `BENCH_MIDDLEWARE_KIND=realistic`, which registers middleware that awaits, reads a header and allocates. The default benchmark middleware only returns `next()`, and against it the wrapper is close to the entire cost of a middleware, which overstates the result. Both servers register the same middleware, and Fastify is reported as a control.

Averages across all nine scenarios, 8 seconds each.

| Middleware | before | after | Raw | Fastify control | Control-adjusted |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 20 | 55,626 | 56,508 | +1.59% | −0.00% | **+1.59%** |
| 6, run 1 | 96,517 | 97,090 | +0.59% | +1.50% | −0.91% |
| 6, run 2 | 95,886 | 97,806 | +2.00% | +0.79% | +1.21% |

### Reading

What is removed is a fixed cost per instrumented call site, not a share of the work a middleware performs, so the saving grows with the number of middleware rather than with how heavy they are. At 20 middleware it is about 0.3 µs per request across the roughly two dozen traced call sites a request passes through.

At 20 middleware the improvement is consistent and larger than the control drift. At 6 middleware, closer to what a default AdonisJS kernel registers, the two runs land on opposite sides of zero, so the effect is at or below the noise floor of this setup and should not be quoted as a number. With no middleware there is nothing measurable, which is expected: only four call sites remain.

Anyone reproducing this should run both revisions more than once and report the control, because the run-to-run drift here is comparable to the effect being measured.

### Raw results

- [`router-tracing-mw20-before.json`](./router-tracing-mw20-before.json) / [`router-tracing-mw20-after.json`](./router-tracing-mw20-after.json)
- [`router-tracing-mw6-before.json`](./router-tracing-mw6-before.json) / [`router-tracing-mw6-after.json`](./router-tracing-mw6-after.json)
- [`router-tracing-mw6-before-2.json`](./router-tracing-mw6-before-2.json) / [`router-tracing-mw6-after-2.json`](./router-tracing-mw6-after-2.json)
