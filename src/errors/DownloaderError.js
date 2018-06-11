class DownloaderError extends Error {
  constructor(message, statusText) {
    super(message)
    this.statusText = statusText
  }
}

module.exports = DownloaderError
