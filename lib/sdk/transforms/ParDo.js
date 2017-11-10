const PTransform = require('./PTransform');

class ParDo {
  static of(fn) {
    return new PTransform(fn);
  }
}

module.exports = ParDo;
