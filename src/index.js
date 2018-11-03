const server = require('http').createServer()
const io = require('socket.io')(server)
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
    console.log(data)
    const requestIdStringPart = Math.random().toString(36).substring(2, 6)
    const now = new Date()
    local.requestId = `${utils.pad(now.getMonth())}.${utils.pad(now.getDate())}-` +
      `${utils.pad(now.getHours())}.${utils.pad(now.getMinutes())}.${utils.pad(now.getSeconds())}-` +
      `${utils.pad(now.getMilliseconds(), 3)}-${requestIdStringPart}`

    if (local.socketAdapter) {
      local.socketAdapter.deactivate()
    }

    local.socketAdapter = new SocketAdapter(client, local.requestId, data.previews)
    local.socketAdapter.requestMetadata()
  })

  client.on('request_downloading', function (preview) {
    console.log(preview)

    if (local.socketAdapter) {
      local.socketAdapter.requestProcessing(preview.entry)
    } else {
      console.error(`There's no socketAdapter.`)
    }
  })

  client.on('request_archiving', function (previews) {
    local.socketAdapter.requestArchiving(local.requestId, previews)
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

