const youtubedl = require('youtube-dl')
const fs = require('fs-extra')
const PREVIEW_STATUS = require('./previewStatus')

const PATTERNS = [
  {
    name: 'youtube-video',
    regexp: new RegExp('^https://www\.youtube\.com/watch\\?v=[A-Za-z0-9+/]{11}$')
  }
]

const PATTERNS_MAP = {}
for (let pattern of PATTERNS) {
  PATTERNS_MAP[pattern.name] = pattern
}

module.exports.checkPattern = (requestId, i, url, name) => Promise.resolve()
  .then(() => {
    if (name) {
      let pattern = PATTERNS_MAP[name]
      if (!pattern) {
        throw new Error(`Pattern ${name} not found`)
      }
      if (pattern.regexp.test(url)) {
        return pattern
      }
      throw new Error(`Url ${url} doesn't match ${name} pattern`)
    } else {
      for (let pattern of PATTERNS) {
        if (pattern.regexp.test(url)) {
          return pattern.name
        }
      }
      throw new Error(`Url ${url} doesn't match any patterns`)
    }
  })

