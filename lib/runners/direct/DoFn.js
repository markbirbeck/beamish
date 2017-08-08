class DoFn {
  init(props) {
    Object.keys(props).forEach(key => {
      this[key] = props[key];
    });
    return this;
  }

  processElement() {
    throw new Error('processElement() not implemented');
  }
}

module.exports = DoFn;
