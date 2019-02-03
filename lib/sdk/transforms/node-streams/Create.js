const ParDo = require('./../../harnesses/node-streams/ParDo')
const CreateReaderFn = require('./../../io/node-streams/CreateReaderFn')

class Create {
  /**
   * Returns a new {@code Create.Values} transform that produces a {@link
   * PCollection} containing elements of the provided {@code Iterable}.
   *
   * <p>The argument should not be modified after this is called.
   */

  static of(elems) {
    return new Create.Values(elems)
  }
}

Create.Values = class {
  constructor(elems) {
    this.elems = elems
  }

  expand(input) {
    const source = ParDo.of(new CreateReaderFn(this.elems))
    return input.apply(source)
  }
}

module.exports = Create
