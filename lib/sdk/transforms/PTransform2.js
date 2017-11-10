class PTransform {
  constructor(input) {
    this._input = input;
  }

  apply() {
    return this._input.serialize();
  }

}

module.exports = PTransform;
