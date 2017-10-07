class DoFn {
  init(props) {
    Object.keys(props).forEach(key => {
      this[key] = props[key];
    });
    return this;
  }

  processElement(c) {
    c.output(this.apply(c.element()));
  }

  apply() {
    throw new Error('apply() not implemented or processElement() not overridden');
  }
}

module.exports = DoFn;
