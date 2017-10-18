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

  processElement(pe) {
    this.doFn.processElement(pe);
  }

  finishBundle(pe) {
    if (this.doFn.processFinish) {
      this.doFn.processFinish(pe);
    }
    pe.output(pe.element());
  }

  of(fn) {
    this.doFn = new PTransform(fn);
    return this;
  }
}

module.exports = () => new ParDo();
