const debug = require('debug')('DoFnAsReadable')
const stream = require('stream')

class DoFnAsReadable extends stream.Readable {
  constructor(fn) {
    debug('constructor')
    super({ objectMode: fn.objectMode })
    this.fn = fn
    this.setupComplete = false
  }

  /**
   * When the upstream handler is ready for more, then unpause the
   * wrapped stream. On first pass through set up event handlers:
   */

  async _read() {
    debug('_read')
    if (!this.setupComplete) {
      this.setupComplete = true
      await this.fn.setup()

      /**
       * When there is no more data, let the upstream handler
       * know, and ask the downstream handler to destroy itself:
       */

      this.fn.on('end', () => {
        debug('end')
        this.push(null)
        this.fn.teardown()
      })

      this.fn.on('data', chunk => {
        debug('data (', chunk, ')')
        if (!this.push(chunk)) {
          this.fn.pause()
        }
      })
    }

    this.fn.resume()
  }
}

module.exports = DoFnAsReadable
