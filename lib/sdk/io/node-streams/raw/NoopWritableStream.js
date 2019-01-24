const debug = require('debug')('NoopWritableStream')
const stream = require('stream')

/**
 * A writable stream that just drops any input.
 */
class NoopWritableStream extends stream.Writable {
  _write(body, enc, next) {
    debug.extend('_write')(`Dropping ${JSON.stringify(body)}`)
    next()
  }
}

module.exports = NoopWritableStream
