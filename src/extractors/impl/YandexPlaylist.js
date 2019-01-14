const DefaultExtractor = require('../DefaultExtractor')
const {mapFormats} = require('../../utils/utils')

class SoundcloudArtist extends DefaultExtractor {
  static get name() {
    return 'bandcamp-album'
  }

  static get regexp() {
    return new RegExp('^https://music.yandex\.ru/users/([A-Za-z0-9-_]{1,40})/playlists/([A-Za-z0-9-_]{1,40})')
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
        formats: [{
          filesize: entry.filesize,
          ext: entry.ext,
          format_id: entry.format_id,
          format: entry.format,
          format_note: entry.format_note,
        }],
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

module.exports = SoundcloudArtist
