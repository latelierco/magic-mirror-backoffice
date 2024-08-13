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
}

export default appUtils
