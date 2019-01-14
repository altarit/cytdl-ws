const DefaultExtractor = require('../DefaultExtractor')
const {mapFormats} = require('../../utils/utils')

class Soundcloud extends DefaultExtractor {
  static get name() {
    return 'bandcamp-track'
  }

  static get regexp() {
    return new RegExp('^https://soundcloud\.com/([A-Za-z0-9-]{1,40})/[A-Za-z0-9\\-]{1,60}$')
  }

  static get isMultiple() {
    return false
  }

  static extract(info, url) {
    let regexp = new RegExp('^https://soundcloud\.com/([A-Za-z0-9-]{1,40})/[A-Za-z0-9\\-]{1,60}$')
    let author = url.match(regexp)[1] || 'unknown'
    return {
      title: info.title,
      author: author,
      thumbnail: info.thumbnail,
      formats: mapFormats(info.formats),
    }
  }
}

module.exports = Soundcloud
