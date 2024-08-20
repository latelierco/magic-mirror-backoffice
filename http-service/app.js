'use strict'

const { _E_ } = require('./common/errors')
const path = require('node:path')
const AutoLoad = require('@fastify/autoload')
const getLogger = require('./common/log')
const cors = require('@fastify/cors')


// Pass --options via CLI arguments in command to enable these options.
const options = {}

module.exports = async function (fastify, opts) {
  // Place here your custom code!

  const log = getLogger('APP')

  // CORS
  await fastify.register(cors, {
      origin: '*',
      methods: ['GET'],
      allowedHeaders: ['Accept', 'Content-Type', 'Authorization']
  });

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, opts)
  })

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: Object.assign({}, opts)
  })

  fastify.setErrorHandler(async(err, request, reply) => {

        log.error(err)

        const {
            statusCode = 500,
            message = 'Service Unavailable'
        } = err

        reply.status(statusCode)

        if (err instanceof _E_.STANDARD) {
            const { out = 'Service Unavailable' } = err
            return { statusCode, message }
        }

        return { statusCode, message }
  })
}

module.exports.options = options
