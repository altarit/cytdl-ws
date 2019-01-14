//const path = require('path')
const fs = require('fs-extra')

exports.pad = function (s, len = 2, filler = '0') {
  return ((new Array(len + 1).join(filler)) + s).slice(-len)
}

exports.mapFormats = function (formats) {
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

exports.mkdirs = function (root, ...dirs) {
  if (!fs.existsSync(root)) {
    fs.mkdirSync(root)
  }

  let current = root
  for (let dir of dirs) {
    current = current + '/' + dir
    if (!fs.existsSync(current)) {
      fs.mkdirSync(current)
    }
  }

  return current
}

exports.generateDateId = function () {
  const requestIdStringPart = Math.random().toString(36).substring(2, 6)
  const now = new Date()
  return `${this.pad(now.getMonth())}.${this.pad(now.getDate())}-` +
    `${this.pad(now.getHours())}.${this.pad(now.getMinutes())}.${this.pad(now.getSeconds())}-` +
    `${this.pad(now.getMilliseconds(), 3)}-${requestIdStringPart}`
}

exports.encodeDangerousFilePath = function (oldPath) {
  if (typeof oldPath !== 'string') {
    throw new TypeError(`Path is not a string.`)
  }

  return oldPath.replace(/[\\/:?"*<>|]/g, `_`)
}
