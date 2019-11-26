const debug = require('debug')('DoFnAsTransform')
const stream = require('stream')

class DoFnAsTransform extends stream.Transform {
  constructor(fn) {
    debug('constructor')
    super({ objectMode: fn.objectMode })
    this.doFn = fn
  }

  async _transform(chunk, encoding, callback) {
    debug('_transform (', chunk, ')')
    await this.doFn.processElement(this, chunk, encoding)
    callback()
  }

  async _flush(callback) {
    debug('_flush (', this.doFn, ')')
    await this.doFn.finishBundle(this)
    callback()
  }
}

module.exports = DoFnAsTransform
