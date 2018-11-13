const debug = require('debug')('DoFnAsWritable')
const stream = require('stream')

class DoFnAsWritable extends stream.Writable{
  constructor(fn) {
    debug('constructor')
    super({ objectMode: fn.objectMode })
    this.fn = fn
  }

  /**
   * If the downstream handler accepts the data ok, then we can call
   * next():
   */

  async _write(chunk, encoding, next) {
    debug('_write (', chunk, ')')

    if (this.fn.write(chunk, encoding)) {
      debug('next()')
      next()
    } else {
      debug('waiting')
      this.fn.once('drain', next)
    }
  }
}

module.exports = DoFnAsWritable
