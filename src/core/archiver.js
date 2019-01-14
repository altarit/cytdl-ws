const fs = require('fs-extra')
const AdmZip = require('adm-zip')

const PREVIEW_STATUS = require('../constants/previewStatus')
const { mkdirs, encodeDangerousFilePath } = require('../utils/utils')
const rootDir = __dirname

module.exports.requestArchiving = (requestId, previews) => {
  return new Promise((resolve, reject) => {
    const rootDirName = mkdirs(`media`, encodeDangerousFilePath(requestId))
    const archiveDirName = mkdirs(rootDirName, 'zips')
    const archiveFilePath = `${archiveDirName}/${Date.now()}.zip`
    const zip = new AdmZip()

    for (const entry of previews) {
      const { author } = entry

      zip.addLocalFile(entry.href, author)
    }

    zip.writeZip(archiveFilePath, (err) => {
      if (err) {
        console.error(`Error at requestArchiving`, err)
        reject(err)
        return
      }

      console.log(`Created archive ${archiveDirName}`)
      resolve(archiveFilePath)
    })
  })
}
