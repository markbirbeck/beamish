const DoFn = require('./../../harnesses/node-streams/DoFn')

class CountFn extends DoFn {
  constructor() {
    super()
    this.objectMode = true
  }

  setup() {
    this.count = 0
  }

  processElement() {
    this.count++
  }

  finalElement(c) {
    c.output(String(this.count))
  }
}

module.exports = CountFn
