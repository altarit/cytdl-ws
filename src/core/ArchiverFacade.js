const archiver = require('./archiver')

class ArchiverFacade {
  constructor (socketAdapter) {
    this.socketAdapter = socketAdapter
  }

  requestArchiving (requestId, previews) {
    return archiver.requestArchiving(requestId, previews)
      .then(finalFilePath => {
        this.socketAdapter.onArchivingSuccess('TODO: wtf with this argument', requestId, finalFilePath)
      })
      .catch(err => {
        this.socketAdapter.onArchivingError(requestId, err)
      })
  }

}

module.exports = ArchiverFacade
