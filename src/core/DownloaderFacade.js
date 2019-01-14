const downloader = require('./downloader')
const validator = require('../extractors/validator')

class DownloaderFacade {
  constructor(socketAdapter) {
    this.socketAdapter = socketAdapter
  }

  requestMetadata(requestId, previews) {
    Promise.all(previews.map((current, i) => {
      return validator.getExtractorByUrl(current)
        .then(type => {
          this.socketAdapter.onMetadataValidated(requestId, i, type.name)

          return downloader.requestMetadata(requestId, i, current, type)
            .then(info => {
              this.socketAdapter.onMetadataSuccess(requestId, i, info)
            })
            .catch(err => {
              this.socketAdapter.onMetadataError(requestId, err, i)
            })
        })
    }))
      .then(previews => {
        console.log(`All metadata have been reviewed.`)
      })
      .catch(err => {
        console.log(`Error at receiving metadata.`, err)
      })
  }

  requestProcessing(requestId, entry) {
    downloader.requestProcessing(entry, (status, progress) => {
      this.socketAdapter.onProcessingProgress(requestId, entry, status, progress)
    })
      .then(({finalFilePath}) => {
        this.socketAdapter.onProcessingSuccess(requestId, entry, finalFilePath)
      })
      .catch(err => {
        this.socketAdapter.onProcessingError(requestId, err, entry)
      })
  }
}

module.exports = DownloaderFacade
