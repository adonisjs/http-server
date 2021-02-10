const fastify = require('fastify')()

fastify.get('/', (_, reply) => {
  reply.send({ hello: 'world' })
})

fastify.listen(3000, () => {
  console.log('listening on 3000')
})
