'use strict'

const crypto = require('node:crypto')
const path = require('node:path')
const { exec } = require('node:child_process');
const {
  readdir,
  stat,
  mkdir,
  readFile,
  writeFile,
  unlink
} = require('node:fs/promises')


const mime = require('mime-types')
const getLogger = require('../common/log')
const log = getLogger('USER PHOTO SERVICE')



class UserPhotoService {


  async getDirectoryContent(userName) {

    if (!this.isValidUserName())
      throw Error('Error: user name is not valid', { cause: 400 })
    const dirPath = this.getDirectoryPath(userName)

    if (await this.directoryExists(dirPath, userName) === false) {
      await this.createDirectory(dirPath, userName)
      return []
    }
    log.info('getting image directory content - OK')
    return await this.getPhotoFiles(dirPath)
  }


  async saveUserPhotos (userName, photoList) {
    if (!this.isValidUserName())
      throw Error('Error: user name is not valid', { cause: 400 })

    const dirPath = this.getDirectoryPath(userName)

    if (await this.directoryExists(dirPath, userName) === false)
      await this.createDirectory(dirPath, userName)

    await this.saveFilesToFileSystem(photoList, dirPath)
    await this.deleteSelectedUserPhotos(photoList, dirPath)
    await this.modelEncode()

    return await this.getDirectoryContent(userName)
  }


  isValidUserName(userName) {
    if (/^[a-z\-]{2,24}$/.test(userName) === false)
      return false
    return true;
  }


  getDirectoryPath(user) {
    return path.join(__dirname, '../../../dataset/', user)
  }


  async directoryExists(dirPath, userName) {
    try {
      const stats = await stat(dirPath)
      log.info(`directory exists - OK - ${ userName }`)
      return stats.isDirectory()
    } catch(err) {
      log.warn(`Warning: directory does not exist: ${ dirPath }`)
      return false
    }
  }


  async createDirectory(dirPath, userName) {
    try {
      await mkdir(dirPath)
      return void log.info(`created directory - OK - ${ userName }`)
    } catch(err) {
      throw new Error(`could not create directory - ${ userName }`, { cause:err })
    }
  }


  async getPhotoFiles(dirPath) {
    const files = await readdir(dirPath)
    const ps = files.map(fileName => {
        const filePath = this.getFilePath(dirPath, fileName)
        const mimeType = this.getMimeType(filePath)
        return {
          mimeType,
          filePath,
          fileName
        }
      })
      .filter(obj => /^image\/(jpeg|png)$/.test(obj.mimeType))
      .map(async(obj) => {
        const fileCreatedAt = await this.getCreatedDate(obj.filePath)
        const fileData = await this.toBase64(obj.filePath)
        const fileToBase64 = 'data:' + obj.mimeType + ';base64,' + fileData

        return Object.assign(
          {},
          obj,
          {
            fileCreatedAt,
            fileToBase64,
            saveStatus: true,
            deleteStatus: false
          }
        )
      })
    return Promise.all(ps)
  }


  async saveFilesToFileSystem(photoList, dirPath) {
    const ps = photoList
      .filter(
        photo => photo.deleteStatus === false &&
          photo.saveStatus === false
      )
      .map(async(photo) => {
        const { mimeType, fileToBase64 } = photo
        const fileName = this.getFileName(photo)
        const filePath = this.getFilePath(dirPath, fileName)
        const fileData = this.stripFileData(fileToBase64)
        const buf = Buffer.from(fileData, 'base64')
        return await writeFile(filePath, buf)
      });
    return Promise.all(ps)
      .then(() => log.info('saving images to directory - OK'))
  }


  stripFileData(fileToBase64) {
    return fileToBase64.replace(/^data:image\/\w+;base64,/, '')
  }


  async deleteSelectedUserPhotos(photoList, dirPath) {
    const ps = photoList
      .filter(photo => photo.deleteStatus === true && photo.saveStatus === true)
      .map(async(photo) => {
        const fileName = this.getFileName(photo)
        const filePath = this.getFilePath(dirPath, fileName)
        return await unlink(filePath);
      });

    return Promise.all(ps)
      .then(() => log.info('deleting images from directory - OK'))
  }

  async modelEncode() {
    return new Promise((resolve, reject) => {
      const scriptProcess = exec('npm run encode')
      scriptProcess.on('close', () => {
        log.info('generating face recognition model - OK')
        return resolve()
      })
      scriptProcess.on('error', err => reject(err))
    })
  }

  getFilePath(dirPath, file) {
    return `${ dirPath }/${ file }`;
  }


  getFileName(photo) {
    return `${ photo.id }.jpg`
  }


  getMimeType(filePath) {
    return mime.lookup(filePath)
  }

  async getCreatedDate(filePath) {
    const { birthtime } = await stat(filePath)
    return new Date(birthtime).getTime()
  }

  async toBase64(filePath) {
    return await readFile(filePath, { encoding: 'base64' })
  }
}


module.exports = UserPhotoService
