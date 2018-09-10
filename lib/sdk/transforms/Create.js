const DoFn = require('./DoFn');

class Create {
  static of(elems) {
    return new Create.Values(elems);
  }
};

/**
 * [TODO] This should be based on PTransform.
 */

Create.Values = class extends DoFn {
  constructor(elems) {
    super();
    this.elems = elems;
  }

  getElements() {
    return this.elems;
  }

  processElement(c) {
    this.elems.forEach(elem => c.output(elem));
  }
}

module.exports = Create;
