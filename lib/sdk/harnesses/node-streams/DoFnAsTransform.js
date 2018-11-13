const debug = require('debug')('DoFnAsTransform')
const stream = require('stream')

class DoFnAsTransform extends stream.Transform {
  constructor(fn) {
    debug('constructor')
    super({ objectMode: fn.objectMode })
    this.fn = fn
  }

  async _transform(chunk, encoding, callback) {
    debug('_transform (', chunk, ')')
    await this.fn.processElement(this, chunk, encoding)
    callback()
  }

  async _flush(callback) {
    debug('_flush (', this.fn, ')')
    await this.fn.finishBundle(this)
    callback()
  }
}

module.exports = DoFnAsTransform
