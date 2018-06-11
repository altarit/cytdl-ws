const youtubedl = require('youtube-dl')
const fs = require('fs-extra')
const PREVIEW_STATUS = require('../constants/previewStatus')
const mapFormats = require('../extractors/extractors').mapFormats

module.exports.requestMetadata = (requestId, i, current, type) => new Promise((resolve, reject) => {
  let url = current

  youtubedl.getInfo(url, [], (err, info) => {
    if (err) {
      reject(err)
      return
    }
    console.log(info)

    let result = type.extractor.extract(info, url)

    console.log(result)

    if (type.isMultiple) {
      result.total = result.length
    } else {
      result.formats = mapFormats(info.formats)
    }
    resolve(result)
  })
})

module.exports.requestProcessing = (entry, updateProgress) => new Promise((resolve, reject) => {
  let video = youtubedl(entry.url, [`--format=${entry.format.format_id}`], {cwd: __dirname})


  const tempDirName = `temp/${entry.requestId}`
  const tempFilePath = `${tempDirName}/${entry.id}.${entry.format.ext}`

  let size = 0
  let downloaded = 0
  let lastUpdate = 0
  let details = null

  video.on('info', function (info) {
    console.log('size: ' + info.size)
    size = info.size
    details = info
  })

  video.on('data', function (chunk) {
    downloaded += chunk.length
    let progress = Math.round(100 * downloaded / size)

    const now = Date.now()
    if (now - lastUpdate > 2000) {
      lastUpdate = now
      updateProgress(PREVIEW_STATUS.PROCESSING, `Processing...${progress}%`)
    }
  })

  video.on('complete', function (info) {
    console.log('complete')
  })

  video.on('end', function () {
    console.log('end')
    updateProgress(PREVIEW_STATUS.POSTPROCESSING, `Processed. 100%`)
    const finalDirName = `media/${details.creator}`
    const finalFilePath = `${finalDirName}/${details.title}.${entry.format.ext}`

    if (!fs.existsSync(finalDirName)) {
      fs.mkdirSync(finalDirName)
    }
    fs.copy(tempFilePath, finalFilePath)
      .then(cb => {
        resolve({
          finalFilePath: finalFilePath
        })
      })
      .catch(err => {

        reject({
          title: ``,
          status: PREVIEW_STATUS.FAILED_POSTPROCESSING
        })
      })
  })

  if (!fs.existsSync(tempDirName)) {
    fs.mkdirSync(tempDirName)
  }
  video.pipe(fs.createWriteStream(tempFilePath))
})
