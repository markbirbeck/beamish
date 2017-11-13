const PTransform = require('./PTransform');

class ParDo {
  constructor() {
    this.started = false;
    this.doFn = null;
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

  of(fn) {
    this.doFn = new PTransform(fn);
    return this;
  }
}

module.exports = () => new ParDo();
