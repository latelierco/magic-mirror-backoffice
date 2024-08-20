'use strict'

const path = require('node:path')
const { readdir, stat, mkdir, readFile } = require('node:fs/promises')
const mime = require('mime-types')

class UserPhotoService {


	async getDirectoryContent(user) {
		const dirPath = this.getDirectoryPath(user)
		// console.debug('///// dirPath', dirPath)
		if (await this.directoryExists(dirPath) === false) {
			await this.createDirectory(dirPath)
			return []
		}
		return await this.getPhotoFiles(dirPath)
	}

	getDirectoryPath(user) {
		return path.join(__dirname, '../../../dataset/', user)
	}

	async directoryExists(dirPath) {
		const stats = await stat(dirPath)
		return stats.isDirectory()
	}

	async createDirectory(dirPath) {
		return await mkdir(dirPath)
	}

	async getPhotoFiles(dirPath) {
		const files = await readdir(dirPath)
		const ps = files.map(file => {
				const filePath = this.getFilePath(dirPath, file)
				const mimeType = this.getMimeType(filePath)
				return {
					mimeType,
					filePath,
					file
				}
			})
			.filter(obj => /^image\/(jpeg|png)$/.test(obj.mimeType))
			.map(async(obj) => {
				const fileCreatedAt = await this.getCreatedDate(obj.filePath)
				const fileToBase64 = await this.toBase64(obj.filePath)
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

	getFilePath(dirPath, file) {
		return `${ dirPath }/${ file }`;
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
