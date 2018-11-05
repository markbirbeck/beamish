const stream = require('stream')

class DoFnAsTransform extends stream.Transform {
  constructor(fn) {
    super({ objectMode: fn.objectMode })
    this.fn = fn
  }

  async _transform(chunk, encoding, callback) {
    await this.fn.callSetup()
    await this.fn.callProcessElement(this, chunk, encoding)
    callback()
  }

  async _flush(callback) {
    await this.fn.callFinalElement(this)
    await this.fn.callTeardown()
    callback()
  }
}

module.exports = DoFnAsTransform
