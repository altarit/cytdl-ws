const youtubedl = require('youtube-dl')
const fs = require('fs-extra')
const PREVIEW_STATUS = require('../constants/previewStatus')
const { mkdirs, encodeDangerousFilePath } = require('../utils/utils')
const rootDir = __dirname

module.exports.requestMetadata = (requestId, i, current, type) => new Promise((resolve, reject) => {
  let url = current

  youtubedl.getInfo(url, [], (err, info) => {
    if (err) {
      reject(err)
      return
    }

    //console.log(info)
    const result = type.extract(info, url)

    if (!result.title || !result.author) {
      //console.log(result)
      result.author = 'Unknown author'
      //throw new Error('Missed video info properties.')
    }

    resolve(result)
  })
})

module.exports.requestProcessing = (entry, updateProgress) => {
  const rootDirName = mkdirs(`media`, encodeDangerousFilePath(entry.requestId))
  const tempDirName = mkdirs(rootDirName, 'temp')
  const tempFilePath = `${tempDirName}/${entry.id}-${entry.subId || ''}.${entry.format && entry.format.ext || 'unknown'}`

  //const finalDirName = mkdirs(`media/loaded/`, encodeDangerousFilePath(entry.author))
  const finalDirName = mkdirs(rootDirName, 'media')
  const finalFilePath = `${finalDirName}/` +
    `${encodeDangerousFilePath(entry.title)}[${entry.format.format_id}].${entry.format.ext}`

  if (!entry.format.special) {
    return processWrapped(tempFilePath, finalFilePath, entry.url, entry.format, updateProgress)
  } else {
    return processNative(tempFilePath, finalFilePath, entry.url, entry.format, updateProgress)
  }
}

function processWrapped (tempFilePath, finalFilePath, url, format, updateProgress) {
  return new Promise((resolve, reject) => {
    const video = youtubedl(url, [`--format=${format.format_id}`], { cwd: rootDir })

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
      const progress = Math.round(100 * downloaded / size)

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
          console.error(`Error at moving a file.`, err)
          reject({
            title: ``,
            status: PREVIEW_STATUS.FAILED_POSTPROCESSING
          })
        })
    })

    video.pipe(fs.createWriteStream(tempFilePath))
  })
}

function processNative (tempFilePath, finalFilePath, url, format, updateProgress) {
  updateProgress(PREVIEW_STATUS.PROCESSING, `Processing... Please wait.`)

  return new Promise((resolve, reject) => {
    youtubedl.exec(url, ['-x', '--audio-format', format.ext, '-o', tempFilePath], {}, function(err, output) {
      if (err) {
        reject({
          title: ``,
          status: PREVIEW_STATUS.FAILED_POSTPROCESSING
        })
        return
      }

      //console.log(output.join('\n'));
      updateProgress(PREVIEW_STATUS.PROCESSING, `Processing...${100}%`)

      fs.copy(tempFilePath, finalFilePath)
        .then(cb => {
          resolve({
            finalFilePath: finalFilePath
          })
        })
        .catch(err => {
          console.error(`Error at moving a file.`, err)
          reject({
            title: ``,
            status: PREVIEW_STATUS.FAILED_POSTPROCESSING
          })
        })
    });
  })
}
