const youtubedl = require('youtube-dl')
const fs = require('fs-extra')
const PREVIEW_STATUS = require('./previewStatus')
const DownloaderError = require('./DownloaderError')
const extractors = require('./infoExtractors')

const PATTERNS = [
  {
    name: 'youtube-video',
    regexp: new RegExp('^https://www\.youtube\.com/watch\\?v=[A-Za-z0-9+/]{11}$'),
    isMultiple: false,
    extractor: extractors.Youtube,
  },
  {
    name: 'youtube-playlist',
    regexp: new RegExp('^https://www\.youtube\.com/playlist\\?list=[A-Za-z0-9+/_\\-]{20,40}$'),
    isMultiple: true,
    extractor: extractors.YoutubeList,
  },
  {
    name: 'bandcamp-track',
    regexp: new RegExp('^https://([A-Za-z0-9]{1,40})\.bandcamp\.com/track/[A-Za-z0-9\\-]{1,60}$'),
    isMultiple: false,
    extractor: extractors.Bandcamp,
  },
  {
    name: 'bandcamp-album',
    regexp: new RegExp('^https://([A-Za-z0-9]{1,40})\.bandcamp\.com/album/[A-Za-z0-9]{1,60}$'),
    isMultiple: true,
    extractor: extractors.BandcampAlbum,
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
          return pattern
        }
      }
      throw new DownloaderError(`Url ${url} doesn't match any patterns`, `Invalid url`)
    }
  })

