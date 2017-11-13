const PTransform = require('./PTransform');

class ParDo {
  static of(fn) {
    return new ParDo.SingleOutput(fn);
  }

  static get SingleOutput() {
    return class SingleOutput extends PTransform {
      constructor(fn) {
        super();
        this.fn = fn;
      }
    }
  }
}

module.exports = ParDo;
