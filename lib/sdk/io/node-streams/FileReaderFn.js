const fs = require('fs')

const DoFn = require('./../../harnesses/node-streams/DoFn')

class FileReaderFn extends DoFn {
  constructor(fileName) {
    super()
    this.fileName = fileName
  }

  /*
   * Note that there is no need for a teardown() since the default for
   * the writable stream is to auto close:
   */

  setup() {
    this.stream = fs.createReadStream(this.fileName)
  }
}

module.exports = FileReaderFn
