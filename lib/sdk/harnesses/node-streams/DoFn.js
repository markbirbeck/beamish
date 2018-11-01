const stream = require('stream')

const ProcessContext = require('./ProcessContext')

class DoFn extends stream.Transform {
  _transform(chunk, encoding, callback) {
    this.processElement(new ProcessContext(this, chunk, encoding))
    callback()
  }

  _flush(callback) {
    this.finalElement(new ProcessContext(this, ''))
    callback()
  }
}

module.exports = DoFn
