const util = require('util')
const stream = require('stream')

const pipeline = util.promisify(stream.pipeline)

class DirectHarness {
  constructor(steps) {
    this.steps = steps
  }

  processBundle() {
    return pipeline(...this.steps)
  }
}

module.exports = DirectHarness
