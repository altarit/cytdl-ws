// const downloader = require('../core/downloader')
// const validator = require('../extractors/validator')
const DownloaderFacade = require('../core/DownloaderFacade')
const ArchiverFacade = require('../core/ArchiverFacade')
const PREVIEW_STATUS = require('../constants/previewStatus')


const PREVIEW_SCREEN_PREVIEW_WS_UPDATE = 'PREVIEW_SCREEN_PREVIEW_WS_UPDATE'
const PREVIEW_SCREEN_PREVIEW_HEADER_UPDATE = 'PREVIEW_SCREEN_PREVIEW_HEADER_UPDATE'

class SocketAdapter {
  constructor(client, requestId, previews) {
    this.client = client
    this.requestId = requestId
    this.previews = previews
    this.active = true

    const self = this

    const proxy = new Proxy(this, {
      get(target, propKey, receiver) {
        console.log(`Callback ${propKey} was intercepted for ${requestId}`)


        if (!self.active) {
          return (requestId, ...args) => {
            console.log(`Deactivated.`)
            return null
          }
        }

        const origMethod = target[propKey]
        return (requestId, ...args) => {
          const result = origMethod.apply(self, args)
          return result
        }
      }
    })

    this.downloaderFacade = new DownloaderFacade(proxy)

    this.archiverFacade = new ArchiverFacade(proxy)
  }

  requestMetadata() {
    this.downloaderFacade.requestMetadata(this.requestId, this.previews)
  }

  requestProcessing(entry) {
    this.downloaderFacade.requestProcessing(this.requestId, entry)
  }

  requestArchiving(entries) {
    this.archiverFacade.requestArchiving(this.requestId, entries)
  }

  deactivate() {
    console.log(`Deactivated socket adapter '${this.requestId}'`)
    this.active = false
  }

  onMetadataValidated(i, type) {
    this.client.emit('action', {
      type: PREVIEW_SCREEN_PREVIEW_WS_UPDATE,
      previews: [{
        id: i,
        title: '',
        status: PREVIEW_STATUS.RECEIVING_METADATA,
        requestId: this.requestId,
      }]
    })
  }

  onMetadataSuccess(i, info) {
    this.client.emit('action', {
      type: PREVIEW_SCREEN_PREVIEW_WS_UPDATE,
      previews: [{
        id: i,
        title: info.title,
        author: info.author,
        status: PREVIEW_STATUS.READY,
        requestId: this.requestId,
        formats: info.formats,
        thumbnail: info.thumbnail,
        children: info.children ? info.children.map(el => Object.assign(el, {
          id: i,
          status: PREVIEW_STATUS.READY,
          requestId: this.requestId,
          formats: el.formats,
          enabled: true,
        })) : null,
      }]
    })
  }

  onMetadataError(err, i) {
    console.error(`onMetadataError:`, err)
    let statusText = err.statusText || err.message
    this.client.emit('action', {
      type: PREVIEW_SCREEN_PREVIEW_WS_UPDATE,
      previews: [{
        id: i,
        title: '',
        author: '',
        status: PREVIEW_STATUS.FAILED_PREVIEW,
        statusText: statusText,
        requestId: this.requestId,
      }]
    })
  }

  onProcessingProgress(entry, status, progress) {
    this.client.emit('action', {
      type: PREVIEW_SCREEN_PREVIEW_WS_UPDATE,
      previews: [{
        id: entry.id,
        subId: entry.subId,
        status: status,
        statusText: progress,
      }]
    })
  }

  onProcessingSuccess(entry, finalFilePath) {
    this.client.emit('action', {
      type: PREVIEW_SCREEN_PREVIEW_WS_UPDATE,
      previews: [{
        id: entry.id,
        subId: entry.subId,
        status: PREVIEW_STATUS.COMPLETED,
        href: finalFilePath,
        title: entry.title,
      }]
    })
  }

  onProcessingError(err, entry) {
    console.error(`onProcessingError: ${err.message}`, err)
    this.client.emit('action', {
      type: PREVIEW_SCREEN_PREVIEW_WS_UPDATE,
      previews: [{
        id: entry.id,
        subId: entry.subId,
        status: err.status || PREVIEW_STATUS.UNKNOWN_ERROR,
      }]
    })
  }

  onArchivingSuccess(requestId, finalFilePath) {
    this.client.emit('action', {
      type: PREVIEW_SCREEN_PREVIEW_HEADER_UPDATE,
      requestId: requestId,
      finalFilePath: finalFilePath,
      completed: true,
    })
  }

  onArchivingError(entry, err) {
    this.client.emit('action', {
      type: PREVIEW_SCREEN_PREVIEW_HEADER_UPDATE,
      completed: false,
      err: err,
    })
  }
}

module.exports = SocketAdapter
