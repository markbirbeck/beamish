const PTransform = require('./PTransform');

class ParDo { }

ParDo.SingleOutput = class SingleOutput extends PTransform {
  constructor(fn) {
    super()
    this.fn = fn
  }
}
ParDo.of = fn => new ParDo.SingleOutput(fn)

module.exports = ParDo;
