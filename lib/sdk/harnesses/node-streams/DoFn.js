const ProcessContext = require('./ProcessContext')

class DoFn {
  _processElement(stream, chunk, encoding) {
    this.processElement(new ProcessContext(stream, chunk, encoding))
  }

  _finalElement(stream) {
    this.finalElement(new ProcessContext(stream, ''))
  }
}

module.exports = DoFn
