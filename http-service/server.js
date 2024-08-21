/**
 * server
 */

const dotenv = require('dotenv')
dotenv.config({ path: `.env.${ process.env.NODE_ENV }` })

const { fastify } = require('fastify')
const pino = require('pino')
const closeWithGrace = require('close-with-grace')

const HOST = process.env.HOST || '0.0.0.0'
const PORT = parseInt(process.env.PORT, 10) || 7000

const server = fastify({
    logger: pino({ level: 'debug' }),
    pluginTimeout: 3000
})

server.register(require('@fastify/sensible'))

// Register your application
// as a normal plugin.
const app = require('./app')
server.register(app)


// delay is the number of milliseconds
// for the graceful close to finish
const closeListeners = closeWithGrace({
    delay: parseInt(process.env.FASTIFY_CLOSE_GRACE_DELAY, 10) || 500
    // eslint-disable-next-line no-unused-vars
}, async({ signal, err, manual }) => {
    if (err)
        server.log.error(err)
    await server.close()
})

// close event
server.addHook('onClose', (instance, done) => {
    closeListeners.uninstall()
    done()
})

// start listening
server.listen({
    port: PORT,
    host: HOST
}, err => {
    if (err) {
        server.log.error(err)
        // eslint-disable-next-line no-process-exit
        process.exit(1)
    }
    // eslint-disable-next-line no-console
    console.log(`server listening on port: ${ PORT }`)
})
