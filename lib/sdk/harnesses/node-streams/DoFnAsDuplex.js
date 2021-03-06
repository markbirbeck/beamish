const debug = require('debug')('DoFnAsDuplex')
const stream = require('stream')

class DoFnAsDuplex extends stream.Duplex {
  constructor(fn) {
    debug('constructor')
    super({ objectMode: fn.objectMode })
    this.doFn = fn
  }

  /**
   * Implementation of the _read() method on the Readable side of
   * the Duplex.
   */
  _read() {
    debug('_read')

    /**
     * When the upstream handler is ready for more, then unpause the
     * wrapped stream. On first pass through set up event handlers:
     */
    if (!this.setupComplete) {
      this.setupComplete = true

      /**
       * When there is no more data, let the upstream handler
       * know:
       *
       * Note that this is different to DoFnAsReadable, which will
       * also call finishBundle(); this is left until the Writable side
       * of the Duplex has finished (see _final(), below).
       */
      this.doFn.on('end', async () => {
        debug('end')
        this.push(null)
      })

      /**
       * When data arrives then forward it on. If the Readable side
       * needs backpressure (i.e., push() returns false) then pause
       * the incoming stream:
       */
      this.doFn.on('data', chunk => {
        debug('data (', chunk, ')')
        if (!this.push(chunk)) {
          this.doFn.pause()
        }
      })
    }

    this.doFn.resume()
  }

  /**
   * Implementation of the _write() method on the Writable side of
   * the Duplex.
   */
  _write(chunk, encoding, next) {
    debug('_write (', chunk, ')')

    /**
     * If the downstream handler accepts the data ok, then we can call
     * next():
     */
    if (this.doFn.write(chunk, encoding)) {
      debug('next()')
      next()
    } else {
      debug('waiting')
      this.doFn.once('drain', next)
    }
  }

  /**
   * Implementation of the _final() method on the Writable side of
   * the Duplex.
   */
  _final(callback) {
    debug('_final (', this.doFn, ')')
    this.doFn.end(async () => {
      await this.doFn.finishBundle(this)
      callback()
    })
  }
}

module.exports = DoFnAsDuplex
