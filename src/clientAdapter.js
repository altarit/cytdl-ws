const downloader = require('./downloader')
const validator = require('./validator')

class ClientAdapter {
  constructor() {
    this.metadataValidatedHandler = this._emptyHandler
    this.metadataSuccessHandler = this._emptyHandler
    this.metaDataErrorHandler = this._emptyHandler
    this.processingProgressHandler = this._emptyHandler
    this.processingSuccessHandler = this._emptyHandler
    this.processingErrorHandler = this._emptyHandler
  }

  _emptyHandler() {
    throw Error('No handler was set.')
  }

  onMetadataValidated(validatedHandler) {
    this.metadataValidatedHandler = validatedHandler
    return this
  }

  onMetadataSuccess(successHandler) {
    this.metadataSuccessHandler = successHandler
    return this
  }

  onMetadataError(errorHandler) {
    this.metaDataErrorHandler = errorHandler
    return this
  }

  onProcessingProgress(handler) {
    this.processingProgressHandler = handler
    return this
  }

  onProcessingSuccess(successHandler) {
    this.processingSuccessHandler = successHandler
    return this
  }

  onProcessingError(errorHandler) {
    this.processingErrorHandler = errorHandler
    return this
  }

  init(requestId, previews) {
    Promise.all(previews.map((current, i) => {
      validator.checkPattern(requestId, i, current)
        .then(type => {
          this.metadataValidatedHandler(requestId, i, type)
        })
        .then(res => downloader.requestMetadata(requestId, i, current))
        .then(info => {
          this.metadataSuccessHandler(requestId, i, info)
        })
        .catch(err => {
          this.metaDataErrorHandler(err, requestId, i)
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

  requestProcessing(entry) {
    downloader.requestProcessing(entry, (status, progress) => {
      this.processingProgressHandler(entry, status, progress)
    })
      .then(({finalFilePath}) => {
        this.processingSuccessHandler(entry, finalFilePath)
      })
      .catch(err => {
        this.processingErrorHandler(err, entry)
      })
  }
}

module.exports = ClientAdapter
