const ProcessContext = require('./ProcessContext')

class DoFn {
  constructor() {
    this.setupComplete = false
    this.teardownComplete = false
  }

  callSetup() {
    if (!this.setupComplete) {
      this.setupComplete = true
      if (this.setup) {
        return this.setup()
      }
    }
  }

  callTeardown() {
    if (!this.teardownComplete) {
      this.teardownComplete = true
      if (this.teardown) {
        return this.teardown()
      }
    }
  }

  callProcessElement(stream, chunk, encoding) {
    const pc = new ProcessContext(stream, chunk, encoding)

    this.processElement(pc)
    return pc._lastPush
  }

  callFinalElement(stream) {
    const pc = new ProcessContext(stream, '')

    this.finalElement(pc)
    return pc._lastPush
  }
}

module.exports = DoFn
