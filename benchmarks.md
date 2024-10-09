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

Since the program correctness and reliability is more important over micro optimizations. We pay penalty on following fronts in comparison to Fastify.

- **The AdonisJS query string parser can parse arrays inside the query string** `(/api?foo[]=bar&foo[]=fuzz&foo[]=buzz
)`, wherease fastify doesn't parse it by default for performance reasons. However, you can also define your own query string parser with fastify, but again, you will end up paying the same performance penalty.
- **Subdomain based routing** is another front, where AdonisJS has to perform little bit extra work to find the correct route and it's handler by matching the domains first.
