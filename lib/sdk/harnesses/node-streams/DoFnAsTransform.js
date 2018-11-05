const stream = require('stream')

class DoFnAsTransform extends stream.Transform {
  constructor(fn) {
    super({ objectMode: fn.objectMode })
    this.fn = fn
  }

  async _transform(chunk, encoding, callback) {
    await this.fn.setup()
    await this.fn.processElement(this, chunk, encoding)
    callback()
  }

  async _flush(callback) {
    await this.fn.finalElement(this)
    await this.fn.teardown()
    callback()
  }
}

module.exports = DoFnAsTransform
