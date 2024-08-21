'use strict'

const { _E_ } = require('./common/errors')
const path = require('node:path')
const AutoLoad = require('@fastify/autoload')
const getLogger = require('./common/log')
const cors = require('@fastify/cors')
const {
  httpErrors: {
    createError
  }
} = require('@fastify/sensible')

// Pass --options via CLI arguments in command to enable these options.
const options = {}

module.exports = async function (fastify, opts) {
  // Place here your custom code!

  const log = getLogger('APP')

  // CORS
  await fastify.register(cors, {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
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

  fastify.setNotFoundHandler(async(err, request, reply) => {
    throw createError(404, 'Resource Not Found')
  })

  fastify.setErrorHandler(async(err, request, reply) => {

    const replyError = err?.cause &&
      !isNaN(err.cause) &&
      createError(err.cause) || err

    const {
      statusCode: status = 500,
      message = 'Service Unavailable'
    } = replyError

    log.error(err)
    log.error(replyError)

    reply.status(status)
    return { status, message }
  })
}

module.exports.options = options
