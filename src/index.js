const server = require('http').createServer()
const io = require('socket.io')(server)
const ClientAdapter = require('./clientAdapter')
const PREVIEW_STATUS = require('./previewStatus')

const PREVIEW_SCREEN_PREVIEW_WS_UPDATE = 'PREVIEW_SCREEN_PREVIEW_WS_UPDATE'


io.on('connection', function (client) {
  console.log(`Connected ${client.id}`)

  let adapter = new ClientAdapter()
    .onMetadataValidated((requestId, i, type) => {
      client.emit('action', {
        type: PREVIEW_SCREEN_PREVIEW_WS_UPDATE,
        previews: [{
          id: i,
          title: '',
          status: PREVIEW_STATUS.RECEIVING_METADATA,
          requestId: requestId,
        }]
      })
    })
    .onMetadataSuccess((requestId, i, info) => {
      client.emit('action', {
        type: PREVIEW_SCREEN_PREVIEW_WS_UPDATE,
        previews: [{
          id: i,
          title: info.title,
          author: info.creator,
          status: PREVIEW_STATUS.READY,
          requestId: requestId,
          format: info.chosenFormat,
          thumbnail: info.thumbnail,
        }]
      })
    })
    .onMetadataError((err, requestId, i) => {
      console.log(err)
      let statusText = err.statusText || err.message
      client.emit('action', {
        type: PREVIEW_SCREEN_PREVIEW_WS_UPDATE,
        previews: [{
          id: i,
          title: '',
          author: '',
          status: PREVIEW_STATUS.FAILED_PREVIEW,
          statusText: statusText,
          requestId: requestId,
        }]
      })
    })
    .onProcessingProgress((entry, status, progress) => {
      client.emit('action', {
        type: PREVIEW_SCREEN_PREVIEW_WS_UPDATE,
        previews: [{
          id: entry.id,
          status: status,
          statusText: progress,
        }]
      })
    })
    .onProcessingSuccess((entry, finalFilePath) => {
      client.emit('action', {
        type: PREVIEW_SCREEN_PREVIEW_WS_UPDATE,
        previews: [{
          id: entry.id,
          status: PREVIEW_STATUS.COMPLETED,
          href: finalFilePath,
          title: entry.title,
        }]
      })
    })
    .onProcessingError((err, entry) => {
      console.log(`Err: ${err.message}`)
      console.log(err)
      client.emit('action', {
        type: PREVIEW_SCREEN_PREVIEW_WS_UPDATE,
        previews: [{
          id: entry.id,
          status: err.status || PREVIEW_STATUS.UNKNOWN_ERROR,
        }]
      })
    })

  client.on('request_metadata', function (data) {
    console.log(`Event from ${client.id}`)
    console.log(data)
    let requestId = Math.random().toString(36).substring(7)
    adapter.init(requestId, data.previews)
  })

  client.on('request_downloading', function (preview) {
    console.log(preview)
    adapter.requestProcessing(preview.entry)
  })

  client.on('disconnect', function () {
    console.log(`Disconnected ${client.id}`)
  })
})
server.listen(3500)
console.log(`server started`)

