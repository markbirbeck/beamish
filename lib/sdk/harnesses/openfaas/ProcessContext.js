class ProcessContext {
  constructor(element, output) {
    this._element = element;
    this._output = output;
  }

  element() {
    return this._element;
  }

  output(x) {
    if (!this._output) {
      throw new Error('ProcessContext must have an output() function');
    }
    return this._output(x);
  }
}

module.exports = ProcessContext;
