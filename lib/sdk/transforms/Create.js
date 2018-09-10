const DoFn = require('./DoFn');
const ParDo = require('./ParDo');

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

Create.Values = class {
  constructor(elems) {
    this.elems = elems;
  }

  getElements() {
    return this.elems;
  }

  expand(pipeline) {
    pipeline.apply(
      ParDo.of(new class extends DoFn {
        constructor(elems) {
          super()
          this.elems = elems
        }

        processElement(c) {
          this.elems.forEach(elem => c.output(elem));
        }
      }(this.getElements())
    ))
  }
}

module.exports = Create;
