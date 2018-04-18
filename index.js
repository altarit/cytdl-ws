const fs = require('fs-extra')
const server = require('http').createServer()
const io = require('socket.io')(server)
const youtubedl = require('youtube-dl')

const PREVIEW_SCREEN_PREVIEW_WS_UPDATE = 'PREVIEW_SCREEN_PREVIEW_WS_UPDATE'


const PREVIEW_STATUS = {
  INIT: {id: 0, name: 'Initialized.'},
  VALIDATING: {id: 1, name: 'Validating on the server...'},
  RECEIVING_METADATA: {id: 2, name: 'Receiving metadata...'},
  READY: {id: 3, name: 'Ready.'},

  PROCESSING: {id: 4, name: 'Processing...'},
  POSTPROCESSING: {id: 5, name: 'Postprocessing...'},
  COMPLETED: {id: 10, name: 'Completed...'},

  FAILED_VALIDATION: {id: 20, name: 'Failed validation.'},
  FAILED_PREVIEW: {id: 21, name: 'Failed preview.'},
  FAILED_PROCESSING: {id: 22, name: 'Failed processing.'},
  FAILED_POSTPROCESSING: {id: 23, name: 'Failed postprocessing.'},
}

io.on('connection', function (client) {
  console.log(`Connected ${client.id}`)

  client.on('request_metadata', function (data) {
    console.log(`Event from ${client.id}`)
    console.log(data)

    const requestId = Math.random().toString(36).substring(7)

    for (let i = 0; i < data.previews.length; i++) {
      let current = data.previews[i]
      let url = current

      client.emit('action', {
        type: PREVIEW_SCREEN_PREVIEW_WS_UPDATE,
        previews: [{
          id: i,
          title: '...',
          status: PREVIEW_STATUS.RECEIVING_METADATA,
          requestId: requestId,
        }]
      })

      youtubedl.getInfo(url, [], (err, info) => {
        if (err) {
          console.log(err)
          client.emit('action', {
            type: PREVIEW_SCREEN_PREVIEW_WS_UPDATE,
            previews: [{
              id: i,
              title: 'ET',
              author: 'EA',
              status: PREVIEW_STATUS.FAILED_PREVIEW,
              requestId: requestId,
            }]
          })
          return
        }

        console.log(info)

        let chosenFormat = null
        for (let format of info.formats) {
          if (['m4a', 'mp3'].indexOf(format.ext) !== -1) {
            chosenFormat = format.ext
            break
          }
        }

        if (!chosenFormat) {
          console.log(`Audio files not found`)
          client.emit('action', {
            type: PREVIEW_SCREEN_PREVIEW_WS_UPDATE,
            previews: [{
              id: i,
              title: 'ETF',
              author: 'EAF',
              status: PREVIEW_STATUS.FAILED_PREVIEW,
              requestId: requestId,
            }]
          })
          return
        }

        client.emit('action', {
          type: PREVIEW_SCREEN_PREVIEW_WS_UPDATE,
          previews: [{
            id: i,
            title: info.title,
            author: info.creator,
            status: PREVIEW_STATUS.READY,
            requestId: requestId,
            format: chosenFormat,
            thumbnail: info.thumbnail,
          }]
        })
      })


    }
  })

  client.on('request_downloading', function (preview) {
    console.log(preview)
    let entry = preview.entry
    let video = youtubedl(entry.url, [`--format=${entry.format}`], {cwd: __dirname})


    const tempDirName = `temp/${entry.requestId}`
    const tempFilePath = `${tempDirName}/${entry.id}.${entry.format}`

    let size = 0
    let downloaded = 0
    let lastUpdate = 0
    let details = null

    video.on('info', function (info) {
      console.log('size: ' + info.size)
      size = info.size
      details = info
    })

    video.on('data', function(chunk) {
      downloaded += chunk.length
      let progress = Math.round(100 * downloaded / size)

      const now = Date.now()
      if (now - lastUpdate > 2000) {
        lastUpdate = now

        client.emit('action', {
          type: PREVIEW_SCREEN_PREVIEW_WS_UPDATE,
          previews: [{
            id: entry.id,
            status: PREVIEW_STATUS.PROCESSING,
            title: `${progress}%`,
          }]
        })
      }
    })

    video.on('complete', function(info) {
      console.log('complete');
    });

    video.on('end', function() {
      console.log('end');
      client.emit('action', {
        type: PREVIEW_SCREEN_PREVIEW_WS_UPDATE,
        previews: [{
          id: entry.id,
          status: PREVIEW_STATUS.POSTPROCESSING,
          title: `100%`,
        }]
      })

      const finalDirName = `media/${details.creator}`
      const finalFilePath = `${finalDirName}/${details.title}.${entry.format}`

      if (!fs.existsSync(finalDirName)){
        fs.mkdirSync(finalDirName);
      }
      fs.copy(tempFilePath, finalFilePath)
        .then(cb => {
          client.emit('action', {
            type: PREVIEW_SCREEN_PREVIEW_WS_UPDATE,
            previews: [{
              id: entry.id,
              status: PREVIEW_STATUS.COMPLETED,
              title: details.title,
              href: finalFilePath,
            }]
          })
        })
        .catch(err => {
          client.emit('action', {
            type: PREVIEW_SCREEN_PREVIEW_WS_UPDATE,
            previews: [{
              id: entry.id,
              status: PREVIEW_STATUS.FAILED_POSTPROCESSING,
              title: `Failed post`,
            }]
          })
        })
    });

    if (!fs.existsSync(tempDirName)){
      fs.mkdirSync(tempDirName);
    }
    video.pipe(fs.createWriteStream(tempFilePath))
  })

  client.on('disconnect', function () {
    console.log(`Disconnected ${client.id}`)
  })
})
server.listen(4000)
console.log(`server started`)

