const debug = require('debug')('DoFnAsWritable')
const stream = require('stream')

class DoFnAsWritable extends stream.Writable{
  constructor(fn) {
    debug('constructor')
    super({ objectMode: fn.objectMode })
    this.doFn = fn
  }

  _final(callback) {
    this.doFn.end(async () => {
      await this.doFn.finishBundle(this)
      callback()
    })
  }

  /**
   * If the downstream handler accepts the data ok, then we can call
   * next():
   */

  async _write(chunk, encoding, next) {
    debug('_write (', chunk, ')')

    if (this.doFn.write(chunk, encoding)) {
      debug('next()')
      next()
    } else {
      debug('waiting')
      this.doFn.once('drain', next)
    }
  }
}

module.exports = DoFnAsWritable
