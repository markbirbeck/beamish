const debug = require('debug')('ParDo')
const PTransform = require('./PTransform');

class ParDo {
  constructor() {
    this.debug = debug
    this.setupComplete = false;
    this.started = false;
    this.doFn = null;
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

  startBundle(pe) {
    this.started = true;

    if (this.doFn.processStart) {
      this.doFn.processStart();
    }
  }

  async processElement(pe) {
    return this.doFn.processElement(pe);
  }

  async finishBundle(pe) {
    if (this.doFn.processFinish) {
      return this.doFn.processFinish(pe);
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

  of(fn) {
    this.doFn = new PTransform(fn);
    return this;
  }
}

module.exports = () => new ParDo();
