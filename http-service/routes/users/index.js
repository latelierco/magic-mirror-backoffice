'use strict'

const UserPhotoService = require('../../services/UserPhotoService')
const userPhotoService = new UserPhotoService()

module.exports = async (fastify, opts) => {

  fastify.get('/:userName/photos', async(request, reply) => {
    const { userName = null } = request.params
    if (/^[a-z\-]{2,24}$/.test(userName) === false)
      throw Error('Error: user name nopt valid', { code: 400 })
    return await userPhotoService.getDirectoryContent(userName)
  })
}
