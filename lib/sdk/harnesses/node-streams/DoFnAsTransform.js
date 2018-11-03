const stream = require('stream')

const ProcessContext = require('./ProcessContext')

class DoFnAsTransform extends stream.Transform {
  constructor(fn) {
    super({ objectMode: fn.objectMode })
    this.fn = fn
    this.setupComplete = false
    this.teardownComplete = false
  }

  setup() {
    if (this.fn.setup) {
      return this.fn.setup()
    }
  }

  teardown() {
    if (this.fn.teardown) {
      return this.fn.teardown()
    }
  }

  processElement(chunk, encoding) {
    const pc = new ProcessContext(this, chunk, encoding)

    this.fn.processElement(pc)
    return pc._lastPush
  }

  finalElement() {
    const pc = new ProcessContext(this, '')

    this.fn.finalElement(pc)
    return pc._lastPush
  }

  async _transform(chunk, encoding, callback) {
    if (!this.setupComplete) {
      this.setupComplete = true
      await this.setup()
    }
    await this.processElement(chunk, encoding)
    callback()
  }

  async _flush(callback) {
    await this.finalElement()
    if (!this.teardownComplete) {
      this.teardownComplete = true
      await this.teardown()
    }
    callback()
  }
}

module.exports = DoFnAsTransform
