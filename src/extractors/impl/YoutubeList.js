const DefaultExtractor = require('../DefaultExtractor')
const {mapFormats} = require('../../utils/utils')

class YoutubeList extends DefaultExtractor {
  static get name() {
    return 'youtube-playlist'
  }

  static get regexp() {
    return new RegExp('^https://www\.youtube\.com/playlist\\?list=[A-Za-z0-9+/_\\-]{20,40}$')
  }

  static get isMultiple() {
    return true
  }

  static extract(info, url) {
    let size = info.length
    let first = info[0]
    let author = first.playlist_uploader

    let children = info.map((entry, i) => {
      return {
        title: entry.title,
        author: entry.uploader,
        thumbnail: entry.thumbnail,
        url: entry.webpage_url,
        subId: i,
        formats: mapFormats(entry.formats),
      }
    })
    return {
      title: `${author} - ${first.playlist} - ${size} tracks`,
      author: author,
      thumbnail: first.thumbnail,
      children: children,
      length: children.length,
    }
  }
}

module.exports = YoutubeList
