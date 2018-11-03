const stream = require('stream')

class DoFnAsReadable extends stream.Readable {
  constructor(fn) {
    super({ objectMode: fn.objectMode })
    this.fn = fn
    this.setupComplete = false
    this.teardownComplete = false
  }

  /**
   * When the upstream handler is ready for more, then unpause the
   * wrapped stream. On first pass through set up event handlers:
   */

  _read() {
    if (!this.setupComplete) {
      this.setupComplete = true
      if (this.fn.setup) {
        this.fn.setup()
      }

      /**
       * When there is no more data, let the upstream handler
       * know, and ask the downstream handler to destroy itself:
       */

      this.fn.stream.on('end', () => {
        this.push(null)
        if (!this.teardownComplete) {
          this.teardownComplete = true
          if (this.fn.teardown) {
            this.fn.teardown()
          }
        }
      })

      this.fn.stream.on('data', chunk => {
        if (!this.push(chunk)) {
          this.fn.stream.pause()
        }
      })
    }

    this.fn.stream.resume()
  }
}

module.exports = DoFnAsReadable
