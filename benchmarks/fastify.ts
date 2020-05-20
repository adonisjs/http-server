const fastify = require('fastify')()

fastify.get('/', (_: any, reply: any) => {
  reply.send({ hello: 'world' })
})

fastify.listen(3000, () => {
  console.log('listening on 3000')
})
