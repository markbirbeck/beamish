const DoFn = require('./DoFn');

class Create {
  /**
   * Returns a new {@code Create.Values} transform that produces a {@link
   * PCollection} containing elements of the provided {@code Iterable}.
   *
   * <p>The argument should not be modified after this is called.
   */

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
