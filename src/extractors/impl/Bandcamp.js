const DefaultExtractor = require('../DefaultExtractor')
const {mapFormats} = require('../../utils/utils')

class Bandcamp extends DefaultExtractor {
  static get name() {
    return 'bandcamp-track'
  }

  static get regexp() {
    return new RegExp('^https://([A-Za-z0-9]{1,40})\.bandcamp\.com/track/[A-Za-z0-9\\-]{1,60}$')
  }

  static get isMultiple() {
    return false
  }

  static extract(info, url) {
    let regexp = new RegExp('^https://([A-Za-z0-9]{1,40})\.bandcamp\.com/track/[A-Za-z0-9\\-]{1,60}$')
    let author = url.match(regexp)[1] || 'unknown'
    return {
      title: info.title,
      author: author,
      thumbnail: info.thumbnail,
      formats: mapFormats(info.formats),
    }
  }
}

module.exports = Bandcamp
