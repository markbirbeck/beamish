const DoFn = require('./../../harnesses/node-streams/DoFn')

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
