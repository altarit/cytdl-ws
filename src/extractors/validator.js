const DownloaderError = require('../errors/DownloaderError')

const Youtube = require('./impl/Youtube')
const YoutubeList = require('./impl/YoutubeList')
const Bandcamp = require('./impl/Bandcamp')
const BandcampList = require('./impl/BandcampList')

const PATTERNS_ARRAY = [Youtube, YoutubeList, Bandcamp, BandcampList]

const PATTERNS_MAP = {}
for (let pattern of PATTERNS_ARRAY) {
  PATTERNS_MAP[pattern.name] = pattern
}

module.exports.getExtractorByNameAndCheck = (url, name) => Promise.resolve()
  .then(() => {
    if (!name) {
      throw new Error(`Parameter name is empty`)
    }

    let extractor = PATTERNS_MAP[name]
    if (!extractor) {
      throw new Error(`Extractor ${name} not found`)
    }
    if (extractor.regexp.test(url)) {
      return pattern
    }
    throw new Error(`Url ${url} doesn't match ${name} pattern`)

  })

module.exports.getExtractorByUrl = (url) => Promise.resolve()
  .then(() => {
    for (let extractor of PATTERNS_ARRAY) {
      if (extractor.regexp.test(url)) {
        return extractor
      }
    }
    throw new DownloaderError(`Url ${url} doesn't match any patterns`, `Invalid url`)
  })

