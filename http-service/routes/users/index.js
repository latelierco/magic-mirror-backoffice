'use strict'

const UserPhotoService = require('../../services/UserPhotoService')
const userPhotoService = new UserPhotoService()

const getLogger = require('../../common/log')
const log = getLogger('ROUTE:USERS')


module.exports = async (fastify, opts) => {

  fastify.get('/:userName/photos', async(request, reply) => {
    const { userName = null } = request.params
    return await userPhotoService.getDirectoryContent(userName)
  })

  fastify.patch('/:userName/photos', async(request, reply) => {
    const { userName = null } = request.params
    const { body: photoList } = request;
    return await userPhotoService.saveUserPhotos(userName, photoList)
  })

  fastify.delete('/:userName/photos', async(request, reply) => {
    const { userName = null } = request.params
    return await userPhotoService.deleteUserPhotos(userName)
  })
}
