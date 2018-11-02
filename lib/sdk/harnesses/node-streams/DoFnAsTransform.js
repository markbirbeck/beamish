const stream = require('stream')

class DoFnAsTransform extends stream.Transform {
  constructor(fn) {
    super({ objectMode: fn.objectMode })
    this.fn = fn
    this.setupComplete = false
    this.teardownComplete = false
  }

  setup() {
    if (this.fn.setup) {
      return this.fn.setup()
    }
  }

  teardown() {
    if (this.fn.teardown) {
      return this.fn.teardown()
    }
  }

  async _transform(chunk, encoding, callback) {
    if (!this.setupComplete) {
      this.setupComplete = true
      await this.setup()
    }
    this.fn._processElement(this, chunk, encoding)
    callback()
  }

  async _flush(callback) {
    this.fn._finalElement(this)
    if (!this.teardownComplete) {
      this.teardownComplete = true
      await this.teardown()
    }
    callback()
  }
}

module.exports = DoFnAsTransform
