const DoFn = require('../transforms/DoFn')

class GenerateSequence extends DoFn {
  constructor(from, to) {
    super()
    this.from = from
    this.to = to
  }

  async processElement(c) {
    for (let i = this.from; i <= this.to; i++) {
      await c.output(i)
    }
  }
}

module.exports = GenerateSequence
