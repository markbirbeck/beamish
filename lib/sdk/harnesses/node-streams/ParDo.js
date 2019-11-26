const debug = require('debug')('ParDo')
const ProcessContext = require('./ProcessContext')

class ParDo {
  constructor() {
    this.debug = debug
    this.setupComplete = false
    this.teardownComplete = false
  }

  async setup() {
    this.debug('setup')
    if (!this.setupComplete) {
      this.setupComplete = true
      if (this.doFn.setup) {
        return await this.doFn.setup()
      }
    }
  }

  async teardown() {
    this.debug('teardown')
    if (!this.teardownComplete) {
      this.teardownComplete = true
      if (this.doFn.teardown) {
        return await this.doFn.teardown()
      }
    }
  }

  async processElement(stream, chunk, encoding) {
    this.debug('processElement')
    const pc = new ProcessContext(stream, chunk, encoding)

    await this.doFn.processElement(pc)
    return pc._lastPush
  }

  async finishBundle(stream) {
    this.debug('finishBundle')
    const fbc = new ProcessContext(stream, '')

    if (this.doFn.finishBundle) {
      await this.doFn.finishBundle(fbc)
      return fbc._lastPush
    }
  }
}

class Wrapper extends ParDo {
  constructor(fn) {
    debug('constructor (', fn, ')')
    super()
    this.doFn = fn
    this.objectMode = fn.objectMode
  }

  end(...args) {
    this.debug('register end (', ...args, ')')
    return this.doFn.stream.end(...args)
  }

  on(...args) {
    this.debug('register on (', ...args, ')')
    return this.doFn.stream.on(...args)
  }

  once(...args) {
    this.debug('register once (', ...args, ')')
    return this.doFn.stream.once(...args)
  }

  pause() {
    this.debug('register pause')
    return this.doFn.stream.pause()
  }

  resume() {
    this.debug('register resume')
    return this.doFn.stream.resume()
  }

  write(...args) {
    this.debug('register write (', ...args, ')')
    return this.doFn.stream.write(...args)
  }
}

exports.of = fn => new Wrapper(fn)
