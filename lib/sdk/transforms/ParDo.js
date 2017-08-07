const PTransform = require('./PTransform');

class ParDo {
  of(fn) {
    return new PTransform(fn);
  }
}

module.exports = () => new ParDo();
