const server = require('http').createServer()
const io = require('socket.io')(server)
const axios = require('axios')
const cheerio = require('cheerio')


const PREVIEW_SCREEN_PREVIEW_WS_UPDATE = 'PREVIEW_SCREEN_PREVIEW_WS_UPDATE'


const PREVIEW_STATUS = {
  INIT: {id: 0, name: 'Initialized.'},
  VALIDATING: {id: 1, name: 'Validating on the server...'},
  RECEIVING_METADATA: {id: 2, name: 'Receiving metadata...'},
  READY: {id: 3, name: 'Ready.'},

  DOWNLOADING: {id: 4, name: 'Downloading...'},
  CONVERTING: {id: 5, name: 'Converting...'},

  FAILED_PREVIEW: {id: 20, name: 'Failed preview.'},
  FAILED_DOWNLOAD: {id: 21, name: 'Failed to download.'},
}

io.on('connection', function (client) {
  console.log(`Connected ${client.id}`)

  client.on('request_metadata', function (data) {
    console.log(`Event from ${client.id}`)
    console.log(data)


    for (let i = 0; i < data.previews.length; i++) {
      let current = data.previews[i]
      let url = current

      client.emit('action', {
        type: PREVIEW_SCREEN_PREVIEW_WS_UPDATE,
        previews: [{
          id: i,
          title: '...',
          status: PREVIEW_STATUS.RECEIVING_METADATA,
        }]
      })

      getMeta(url)
        .then(response => {
          //console.log(response.data)
          let $ = cheerio.load(response.data)
          let title = $('#eow-title').text().trim()
          console.log(`title=${title}`)
          let author = $('.yt-user-info > a').text().trim()
          console.log(`author=${author}`)
          client.emit('action', {
            type: PREVIEW_SCREEN_PREVIEW_WS_UPDATE,
            previews: [{
              id: i,
              title: title,
              author: author,
              status: PREVIEW_STATUS.READY,
            }]
          })
        })
    }
  })
  client.on('disconnect', function () {
    console.log(`Disconnected ${client.id}`)
  })
})
server.listen(4000)
console.log(`server started`)

async function getMeta(url) {
  let res = await axios.get(url)

  return res
}
