const youtubedl = require('youtube-dl')
const fs = require('fs-extra')
const PREVIEW_STATUS = require('../constants/previewStatus')
const {mkdirs} = require('../utils/utils')

module.exports.requestMetadata = (requestId, i, current, type) => new Promise((resolve, reject) => {
  let url = current

  youtubedl.getInfo(url, [], (err, info) => {
    if (err) {
      reject(err)
      return
    }

    //console.log(info)
    let result = type.extract(info, url)

    if (!result.title || !result.author) {
      console.log(result)
      result.author = 'qwe'
      //throw new Error('Missed video info properties.')
    }

    resolve(result)
  })
})

module.exports.requestProcessing = (entry, updateProgress) => new Promise((resolve, reject) => {
  let video = youtubedl(entry.url, [`--format=${entry.format.format_id}`], {cwd: __dirname})

  const tempDirName = mkdirs(`temp/`, entry.requestId)
  const tempFilePath = `${tempDirName}/${entry.id}.${entry.format.ext}`

  const finalDirName = mkdirs(`media/`, entry.author)
  const finalFilePath = `${finalDirName}/${entry.title}[${entry.format.format_id}].${entry.format.ext}`

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

  video.pipe(fs.createWriteStream(tempFilePath))
})
