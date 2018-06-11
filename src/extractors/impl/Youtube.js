const DefaultExtractor = require('../DefaultExtractor')
const {mapFormats} = require('../../utils/utils')

class Youtube extends DefaultExtractor {
  static get name() {
    return 'youtube-video'
  }

  static get regexp() {
    return new RegExp('^https://www\.youtube\.com/watch\\?v=[A-Za-z0-9+/]{11}$')
  }

  static get isMultiple() {
    return false
  }

  static extract(info, url) {
    return {
      title: info.title,
      author: info.creator,
      thumbnail: info.thumbnail,
      formats: mapFormats(info.formats),
    }
  }
}

module.exports = Youtube
