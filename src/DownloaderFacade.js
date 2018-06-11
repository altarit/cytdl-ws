const downloader = require('./downloader')
const validator = require('./validator')

class DownloaderFacade {
  constructor(socketAdapter) {
    this.socketAdapter = socketAdapter
  }

  requestMetadata(requestId, previews) {
    Promise.all(previews.map((current, i) => {
      validator.checkPattern(requestId, i, current)
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
        console.log(`All metadata has been reveived.`)
      })
      .catch(err => {
        console.log(`Error at receiving metadata`)
        console.log(err)
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
