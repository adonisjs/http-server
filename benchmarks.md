# Benchmarks
The benchmark scheme is taken from the Fastify Github repo.

**Machine**: MacBook Pro (Quad-Core Intel Core i7, 2.2GHz) 16GB RAM
**Method**: autocannon -c 100 -d 40 -p 10 localhost:3000 * 2, taking the second average

| Framework          | Version                    | Router?      |  Requests/sec  |
| :----------------- | :------------------------- | :----------: | -------------: |
| **Fastify**        | **^3.1.1**                 | **&#10003;** | **53277.6**    |
| **AdonisJS**       | **3.0.0**                  | **&#10003;** | **50313.6**    |

You can run the same benchmarks by cloning the repo and then running the following command.

```sh
npm run benchmark
```

Since the program correctness and reliability is more important over micro optimizations. We pay penalty on following fronts in comparison to Fastify.

- **The AdonisJS query string parser can parse arrays inside the query string** `(/api?foo[]=bar&foo[]=fuzz&foo[]=buzz
)`, wherease fastify doesn't parse it by default for performance reasons. However, you can also define your own query string parser with fastify, but again, you will end up paying the same performance penalty.
- **Subdomain based routing** is another front, where AdonisJS has to perform little bit extra work to find the correct route and it's handler by matching the domains first.
- **Middleware support** is inbuilt in AdonisJS. Whereas, with [fastify you will have to install](https://www.fastify.io/docs/latest/Middleware/) additional packages for middleware support.
