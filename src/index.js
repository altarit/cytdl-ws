const server = require('http').createServer()
const io = require('socket.io')(server)

const downloader = require('./downloader')
const validator = require('./validator')
const PREVIEW_STATUS = require('./previewStatus')

const PREVIEW_SCREEN_PREVIEW_WS_UPDATE = 'PREVIEW_SCREEN_PREVIEW_WS_UPDATE'


io.on('connection', function (client) {
  console.log(`Connected ${client.id}`)

  client.on('request_metadata', function (data) {
    console.log(`Event from ${client.id}`)
    console.log(data)

    const requestId = Math.random().toString(36).substring(7)

    Promise.all(data.previews.map((current, i) => {
      validator.checkPattern(requestId, i, current)
        .then(type => {
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
        .then(res => downloader.requestMetadata(requestId, i, current))
        .then(info => {
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
        .catch(err => {
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
    }))
      .then(previews => {
        console.log(`All metadata has been reveived.`)
      })
      .catch(err => {
        console.log(`Error at receiving metadata`)
        console.log(err)
      })
  })

  client.on('request_downloading', function (preview) {
    console.log(preview)
    let entry = preview.entry

    downloader.requestProcessing(entry, (status, progress) => {
      client.emit('action', {
        type: PREVIEW_SCREEN_PREVIEW_WS_UPDATE,
        previews: [{
          id: entry.id,
          status: status,
          statusText: progress,
        }]
      })
    })
      .then(({finalFilePath}) => {
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
      .catch(err => {
        client.emit('action', {
          type: PREVIEW_SCREEN_PREVIEW_WS_UPDATE,
          previews: [{
            id: entry.id,
            status: err.status || PREVIEW_STATUS.UNKNOWN_ERROR,
          }]
        })
      })
  })

  client.on('disconnect', function () {
    console.log(`Disconnected ${client.id}`)
  })
})
server.listen(3500)
console.log(`server started`)

