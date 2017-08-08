const DoFn = require('./DoFn');

class Create {
  static of(elements) {
    return new Create.Values(elements);
  }
};

/**
 * [TODO] This should be based on PTransform.
 */

Create.Values = class extends DoFn {
  constructor(elements) {
    super();
    this.elements = elements;
  }

  getElements() {
    return this.elements;
  }

  processElement(c) {
    this.elements.forEach(element => c.output(element));
  }
}

module.exports = Create;
