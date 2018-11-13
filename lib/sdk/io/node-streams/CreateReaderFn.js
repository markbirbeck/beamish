const DoFn = require('./../../harnesses/node-streams/DoFn')

class CreateReaderFn extends DoFn {
  constructor(elems) {
    super()
    this.elems = elems
  }

  setup() {
    const CreateReadableStream = require('./raw/CreateReadableStream')
    this.stream = new CreateReadableStream(this.elems)
  }
}

module.exports = CreateReaderFn
