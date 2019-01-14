const DownloaderError = require('../errors/DownloaderError')

const extractors = require('./impl')
const PATTERNS_ARRAY = Object.keys(extractors).reduce((res, name) => {
  console.log(name, res)
  res.push(extractors[name])
  return res
}, [])

const PATTERNS_MAP = {}
for (const pattern of PATTERNS_ARRAY) {
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
      return extractor.pattern
    }
    throw new Error(`Url ${url} doesn't match ${name} pattern`)

  })

module.exports.getExtractorByUrl = (url) => Promise.resolve()
  .then(() => {
    for (const extractor of PATTERNS_ARRAY) {
      if (extractor.regexp.test(url)) {
        return extractor
      }
    }
    throw new DownloaderError(`Url ${url} doesn't match any patterns`, `Invalid url`)
  })

