const stream = require('stream')

class DoFnAsWritable extends stream.Writable{
  constructor(fn) {
    super({ objectMode: fn.objectMode })
    this.fn = fn
    this.setupComplete = false
    this.teardownComplete = false
  }

  _final(callback) {
    this.fn.stream.end(() => {
      if (!this.teardownComplete) {
        this.teardownComplete = true
        if (this.fn.teardown) {
          this.fn.teardown()
        }
      }
    })
    callback()
  }

  /**
   * If the downstream handler accepts the data ok, then we can call
   * next():
   */

  async _write(chunk, encoding, next) {
    if (!this.setupComplete) {
      this.setupComplete = true
      if (this.fn.setup) {
        await this.fn.setup()
      }
    }

    if (this.fn.stream.write(chunk, encoding)) {
      next()
    } else {
      this.fn.stream.once('drain', next)
    }
  }
}

module.exports = DoFnAsWritable
