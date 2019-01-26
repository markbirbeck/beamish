const debug = require('debug')('ParDo')
const ProcessContext = require('./ProcessContext')

class Wrapper {
  constructor(fn) {
    debug('constructor (', fn, ')')
    this.fn = fn
    this.objectMode = fn.objectMode
    this.setupComplete = false
    this.teardownComplete = false
  }

  async setup() {
    this.debug('setup')
    if (!this.setupComplete) {
      this.setupComplete = true
      if (this.fn.setup) {
        return await this.fn.setup()
      }
    }
  }

  async teardown() {
    this.debug('teardown')
    if (!this.teardownComplete) {
      this.teardownComplete = true
      if (this.fn.teardown) {
        return await this.fn.teardown()
      }
    }
  }

  async processElement(stream, chunk, encoding) {
    this.debug('processElement')
    const pc = new ProcessContext(stream, chunk, encoding)

    await this.fn.processElement(pc)
    return pc._lastPush
  }

  async finishBundle(stream) {
    this.debug('finishBundle')
    const fbc = new ProcessContext(stream, '')

    if (this.fn.finishBundle) {
      await this.fn.finishBundle(fbc)
      return fbc._lastPush
    }
  }

  end(...args) {
    this.debug('register end (', ...args, ')')
    return this.fn.stream.end(...args)
  }

  on(...args) {
    this.debug('register on (', ...args, ')')
    return this.fn.stream.on(...args)
  }

  once(...args) {
    this.debug('register once (', ...args, ')')
    return this.fn.stream.once(...args)
  }

  pause() {
    this.debug('register pause')
    return this.fn.stream.pause()
  }

  resume() {
    this.debug('register resume')
    return this.fn.stream.resume()
  }

  write(...args) {
    this.debug('register write (', ...args, ')')
    return this.fn.stream.write(...args)
  }
}

exports.of = fn => new Wrapper(fn)
