const stream = require('stream')

const ProcessContext = require('./ProcessContext')

class DoFn extends stream.Transform {
  constructor() {
    super()
    this._setupComplete = false
    this._teardownComplete = false
  }

  _transform(chunk, encoding, callback) {
    if (!this._setupComplete) {
      this._setupComplete = true
      if (this.setup) {
        this.setup()
      }
    }

    this.processElement(new ProcessContext(this, chunk, encoding))
    callback()
  }

  _flush(callback) {
    this.finalElement(new ProcessContext(this, ''))
    if (!this._teardownComplete) {
      this._teardownComplete = true
      if (this.teardown) {
        this.teardown()
      }
    }
    callback()
  }
}

module.exports = DoFn
