const server = require('http').createServer()
const io = require('socket.io')(server)

io.on('connection', function (client) {
  console.log(`connection`)
  console.log(client)
  client.on('event', function (data) {
  })
  client.on('disconnect', function () {
  })
})
server.listen(4000)
console.log(`server started`)
