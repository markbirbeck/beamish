const DoFn = require('./../../harnesses/node-streams/DoFn')

class CreateReaderFn extends DoFn {
  constructor(elems) {
    super()
    this.elems = elems

    /**
     * Set an objectMode flag so that DoFnAsReadable can set itself up
     * correctly:
     */

    this.objectMode = true
  }

  setup() {
    const CreateReadableStream = require('./raw/CreateReadableStream')
    this.stream = new CreateReadableStream(this.elems)
  }
}

module.exports = CreateReaderFn
