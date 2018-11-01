const stream = require('stream')

class DoFnAsTransform extends stream.Transform {
  constructor(fn) {
    super({ objectMode: fn.objectMode })
    this.fn = fn
    this.setupComplete = false
    this.teardownComplete = false
  }

  _transform(chunk, encoding, callback) {
    if (!this.setupComplete) {
      this.setupComplete = true
      if (this.fn.setup) {
        this.fn.setup()
      }
    }
    this.fn._processElement(this, chunk, encoding)
    callback()
  }

  _flush(callback) {
    this.fn._finalElement(this)
    if (!this.teardownComplete) {
      this.teardownComplete = true
      if (this.fn.teardown) {
        this.fn.teardown()
      }
    }
    callback()
  }
}

module.exports = DoFnAsTransform
