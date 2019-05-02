const fastify = require('fastify')({
    logger: true,
    ignoreTrailingSlash: true
});
fastify.register(require('./api/data'), { prefix: '/api/data' });
fastify.register(require('./api/distance'), { prefix: '/api/distance' });

const start = async () => {
    try {
        await fastify.listen(3000)
        fastify.log.info(`server listening on ${fastify.server.address().port}`)
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}
start();