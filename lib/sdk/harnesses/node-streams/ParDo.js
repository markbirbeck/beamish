const ProcessContext = require('./ProcessContext')

class Wrapper {
  constructor(fn) {
    this.fn = fn
    this.objectMode = fn.objectMode
    this.setupComplete = false
    this.teardownComplete = false
  }

  callSetup() {
    if (!this.setupComplete) {
      this.setupComplete = true
      if (this.fn.setup) {
        return this.fn.setup()
      }
    }
  }

  callTeardown() {
    if (!this.teardownComplete) {
      this.teardownComplete = true
      if (this.fn.teardown) {
        return this.fn.teardown()
      }
    }
  }

  callProcessElement(stream, chunk, encoding) {
    const pc = new ProcessContext(stream, chunk, encoding)

    this.fn.processElement(pc)
    return pc._lastPush
  }

  callFinalElement(stream) {
    const pc = new ProcessContext(stream, '')

    this.fn.finalElement(pc)
    return pc._lastPush
  }

  end() {
    return this.fn.stream.end()
  }

  on(...args) {
    return this.fn.stream.on(...args)
  }

  once(...args) {
    return this.fn.stream.once(...args)
  }

  pause() {
    return this.fn.stream.pause()
  }

  resume() {
    return this.fn.stream.resume()
  }

  write(...args) {
    return this.fn.stream.write(...args)
  }
}

exports.of = fn => new Wrapper(fn)
