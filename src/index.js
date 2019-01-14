const server = require('http').createServer()
const io = require('socket.io')(server)

const log = require('./lib/log').prepareLogger('cytdl.js')
const utils = require('./utils/utils')
const SocketAdapter = require('./network/SocketAdapter')

io.on('connection', function (client) {
  console.log(`Connected ${client.id}`)

  const local = {
    socketAdapter: null,
    requestId: null,
  }

  client.on('request_metadata', function (data) {
    console.log(`Event from ${client.id}`)
    local.requestId = utils.generateDateId()

    if (local.socketAdapter) {
      local.socketAdapter.deactivate()
    }

    local.socketAdapter = new SocketAdapter(client, local.requestId, data && data.previews)
    local.socketAdapter.requestMetadata()
  })

  client.on('request_downloading', function (preview) {
    if (local.socketAdapter) {
      local.socketAdapter.requestProcessing(preview && preview.entry)
    } else {
      console.error(`There's no socketAdapter.`)
    }
  })

  client.on('request_archiving', function (previews) {
    local.socketAdapter.requestArchiving(previews && previews.entries)
  })

  client.on('disconnect', function () {
    console.log(`Disconnected ${client.id}`)
    if (local.socketAdapter) {
      local.socketAdapter.deactivate()
    }
  })
})
server.listen(3500)
console.log(`server started`)

