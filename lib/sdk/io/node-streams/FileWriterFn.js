const fs = require('fs')

const DoFn = require('./../../harnesses/node-streams/DoFn')

class FileWriterFn extends DoFn {
  constructor(fileName) {
    super()
    this.fileName = fileName
  }

  /**
   * Note that there is no need for a teardown() since the default for
   * the writable stream is to auto close:
   */

  setup() {
    return new Promise((resolve, reject) => {
      this.stream = fs.createWriteStream(this.fileName)
      this.stream.on('ready', resolve)
      this.stream.on('error', reject)
    })
  }
}

module.exports = FileWriterFn
