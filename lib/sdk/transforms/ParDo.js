const PCollection = require('../values/PCollection')
const PTransform = require('./PTransform');

class ParDo { }

ParDo.SingleOutput = class SingleOutput extends PTransform {
  constructor(fn) {
    super()
    this.fn = fn
  }

  expand(input) {
    const res = input.apply(
      PCollection.createPrimitiveOutputInternal(input.getPipeline(), this.fn)
    )

    return res
  }
}

ParDo.of = fn => new ParDo.SingleOutput(fn)

module.exports = ParDo;
