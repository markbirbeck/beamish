const DoFn = require('./../../harnesses/direct/DoFn')

class NoopWriterFn extends DoFn {
  setup() {
    const NoopWritableStream = require('./raw/NoopWritableStream')
    this.stream = new NoopWritableStream()
  }

  finishBundle() {
    this.stream.destroy()
  }
}

module.exports = NoopWriterFn
