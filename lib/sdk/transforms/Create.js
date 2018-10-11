const DoFn = require('./DoFn');
const ParDo = require('./ParDo');
const PTransform = require('./PTransform');

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

Create.Values = class extends PTransform {
  constructor(elems) {
    super()
    this.elems = elems;
  }

  getElements() {
    return this.elems;
  }

  expand(input) {
    const source = ParDo.of(new class extends DoFn {
      constructor(elems) {
        super()
        this.elems = elems
      }

      async processElement(c) {
        for (const elem of this.elems) {
          await c.output(elem)
        }
      }
    }(this.getElements()))
    return input.getPipeline().apply(source)
  }
}

module.exports = Create;
