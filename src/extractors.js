function mapFormats(formats) {
  return formats.map(el => {
    return el
    // return {
    //   filesize: el.filesize,
    //   ext: el.ext,
    //   format_id: el.format_id,
    //   format: el.format,
    // }
  })
}

const extractors = {
  Youtube: {
    extract(info, url) {
      return {
        title: info.title,
        author: info.creator,
        thumbnail: info.thumbnail,
      }
    }
  },
  YoutubeList: {
    extract(info, url) {
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
      }
    }
  },
  Bandcamp: {
    extract(info, url) {
      let regexp = new RegExp('^https://([A-Za-z0-9]{1,40})\.bandcamp\.com/track/[A-Za-z0-9\\-]{1,60}$')
      let author = url.match(regexp)[1] || 'unknown'
      return {
        title: info.title,
        author: author,
        thumbnail: info.thumbnail,
      }
    }
  },
  BandcampAlbum: {
    extract(info, url) {
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
}

module.exports = extractors
module.exports.mapFormats = mapFormats
