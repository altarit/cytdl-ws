const DefaultExtractor = require('../DefaultExtractor')
const {mapFormats} = require('../../utils/utils')

class SoundcloudPlaylist extends DefaultExtractor {
  static get name() {
    return 'bandcamp-album'
  }

  static get regexp() {
    return new RegExp('^https://soundcloud\.com/([A-Za-z0-9-]{1,40})/sets/[A-Za-z0-9\\-]{1,60}$')
  }

  static get isMultiple() {
    return true
  }

  static extract(info, url) {
    let size = info.length
    let first = info[0]
    let author = first.playlist_uploader_id

    let children = info.map((entry, i) => {
      return {
        title: entry.title,
        author: entry.playlist_uploader_id,
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
    }
  }
}

module.exports = SoundcloudPlaylist
