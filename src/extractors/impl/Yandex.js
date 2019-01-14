const DefaultExtractor = require('../DefaultExtractor')
const {mapFormats} = require('../../utils/utils')

class Yandex extends DefaultExtractor {
  static get name() {
    return 'bandcamp-track'
  }

  static get regexp() {
    return new RegExp('^https://music.yandex\.ru/album/([A-Za-z0-9-]{1,40})/track/[A-Za-z0-9\\-]{1,60}$')
  }

  static get isMultiple() {
    return false
  }

  static extract(info, url) {
    let regexp = new RegExp('^https://music.yandex\.ru/album/([A-Za-z0-9-]{1,40})/track/[A-Za-z0-9\\-]{1,60}$')
    let author = url.match(regexp)[1] || 'unknown'
    return {
      title: info.title,
      author: author,
      thumbnail: info.thumbnail,
      formats: [{
        filesize: info.filesize,
        ext: info.ext,
        format_id: info.format_id,
        format: info.format,
        format_note: info.format_note,
      }],
    }
  }
}

module.exports = Yandex
