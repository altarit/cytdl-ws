const {Readable, Writable} = require('stream')
const streamify = require('streamify')

test('Error at getting info', async () => {
  jest.doMock('youtube-dl', () => (url, formats, dirname) => {
    console.log('2222222222')
    let count = 0
    let stream = new Readable({
      read(size) {
        if (count === 0) {
          this.emit('info', {
            creator: 'Rick',
            title: 'Never gonna give you up',
            size: 5120
          })
        }
        this.push(new Uint8Array(1024))
        if (count === 5) this.push(null)
        count++
      }
    })

    return stream
  })
  jest.doMock('fs-extra', () => new Object({
    existsSync: (path) => {
      console.log(`Invoked existsSync(${path})`)
      return false
    },
    mkdirSync: (path) => {
      console.log(`Invoked mkdirSync(${path})`)
    },
    createWriteStream: (path) => {
      console.log(`Invoked createWriteStream(${path})`)
      return new Writable({
        write(chunk) {
          console.log('fs.write: ')
          console.log(chunk)
        }
      })
    },
    copy: (inFilePath, outFilePath) => {
      console.log(`fs.copy(${inFilePath} ${outFilePath})`)
      return Promise.resolve()
    }
  }))
  const downloader = require('./downloader')

  let result = await downloader.requestProcessing({
    format: 'mp3'
  }, (status, progress) => {
    console.log('Progress: ', progress, status)
  })
  console.log(result)

  expect(result.finalFilePath).toBe('media/Rick/Never gonna give you up.mp3')
})

