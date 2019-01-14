const fs = require('fs')
const path = require('path')

const { createLogger, format, transports } = require('winston')
const DailyRotateFile = require('winston-daily-rotate-file')
const { combine, printf, splat } = format

const dirPath = './logs/'
const ENV = process.env.NODE_ENV
const stackTraceLength = 1000

module.exports = getLogger
module.exports.prepareLogger = prepareLogger

const myFormat = loggerName => printf(info => {
  const d = new Date()
  const date =
    d.getDate().toString().padStart(2, '0') + '.' +
    (d.getMonth() + 1).toString().padStart(2, '0') + '.' +
    d.getFullYear().toString().padStart(2, '0') + ' ' +
    d.getHours().toString().padStart(2, '0') + ':' +
    d.getMinutes().toString().padStart(2, '0') + ':' +
    d.getSeconds().toString().padStart(2, '0') + '.' +
    d.getMilliseconds().toString().padEnd(3, '0')
  return `${loggerName.slice(-32).padStart(32)} ${date} [${info.level}] ${info.message}`
})

function getLogger (module) {
  const loggerName = module.filename ? module.filename.split('\\').slice(-3).join('\\') : module
  const logger = createLogger({
    transports: [
      new transports.Console({
        level: (ENV === 'development') ? 'debug' : 'info',
        format: combine(splat(), myFormat(loggerName))
      }),
      new DailyRotateFile({
        level: (ENV === 'development') ? 'debug' : 'verbose',
        format: combine(splat(), myFormat(loggerName)),
        filename: path.resolve(dirPath, 'cloudpolis-%DATE%.log'),
        datePattern: 'YYYY-MM-DD-HH',
        maxSize: '20m',
        maxFiles: '14d',
      })
    ]
  })
  logger.stackTrace = function (message, err) {
    if (err && err.stack) {
      this.error(`%s %s`, message,
        err.stack.length >= stackTraceLength ? err.stack.substring(0, stackTraceLength) + '...' : err.stack)
    } else if (message && message.stack) {
      this.error(
        message.stack.length >= stackTraceLength ? message.stack.substring(0, stackTraceLength) + '...' : message.stack)
    } else {
      this.error('stackTrace: ' + message)
    }
  }
  return logger
}

function prepareLogger (module) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath)
  }

  return getLogger(module)
}
