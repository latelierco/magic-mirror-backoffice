const appUtils = {
	capitalize: str => {
		if (typeof str !== 'string') {
			for (const key in str) {
				if (typeof str[key] === 'string') {
					str[key] = appUtils.capitalize(str[key])
				}
			}
			return str
		}
		else {
			return str?.length === 0 && '' || str.split(' ')
				.map(word => word.trim())
				.filter(word => word.length !== 0)
				.map(word => {
					return word.split('')
						.map((char, idx) => idx === 0 && char.toUpperCase() || char.toLowerCase())
						.join('') + ' '
				})
				.join('')
				.trim()
		}
	},
	obectFormatstrings: obj => {
		for (const key in obj) {
			obj[key] = appUtils.capitalize(obj[key])
		}
	},
	extractErrContent: err => {
		return err?.cause && err.cause || err.stack
	},
	slugify: str => {
		return str.trim()
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(' ', '-')
	},
	getUuid: () => window.crypto.randomUUID(),
}

export default appUtils
