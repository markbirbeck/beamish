const stream = require('stream')

class DoFnAsWritable extends stream.Writable{
  constructor(fn) {
    super({ objectMode: fn.objectMode })
    this.fn = fn
  }

  _final(callback) {
    this.fn.end(() => {
      this.fn.callTeardown()
    })
    callback()
  }

  /**
   * If the downstream handler accepts the data ok, then we can call
   * next():
   */

  async _write(chunk, encoding, next) {
    await this.fn.callSetup()

    if (this.fn.write(chunk, encoding)) {
      next()
    } else {
      this.fn.once('drain', next)
    }
  }
}

module.exports = DoFnAsWritable
