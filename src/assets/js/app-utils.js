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
    delete obj.id
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
      .replace(/[^A-z0-9]+/g, '-')
  },
  getDate: () => {
    const now = new Date()
    return now.getFullYear() + '-' +
      ('0' + (now.getMonth() + 1)).slice(-2) + '-' +
      ('0' + now.getDate()).slice(-2) + ' ' +
      ('0' + now.getHours()).slice(-2) + ':' +
      ('0' + now.getMinutes()).slice(-2) + ':' +
      ('0' + now.getSeconds()).slice(-2)
  },
  getPhotoId: fileName => {
    return fileName.replace(/\.jpg/, '')
  },
  getUuid: () => window.crypto.randomUUID(),
}

export default appUtils
