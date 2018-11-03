//const path = require('path')
const fs = require('fs-extra')

module.exports.pad = function (s, len = 2, filler = '0') {
  return ((new Array(len + 1).join(filler)) + s).slice(-len)
}

module.exports.mapFormats = function (formats) {
  return formats.map(el => {
    //return el
    return {
      filesize: el.filesize,
      ext: el.ext,
      format_id: el.format_id,
      format: el.format,
      format_note: el.format_note,
    }
  })
}

module.exports.mkdirs = function (root, ...dirs) {
  if (!fs.existsSync(root)) {
    fs.mkdirSync(root)
  }

  let current = root
  for(let dir of dirs) {
    current = current + '/' + dir
    if (!fs.existsSync(current)) {
      fs.mkdirSync(current)
    }
  }

  return current
}
