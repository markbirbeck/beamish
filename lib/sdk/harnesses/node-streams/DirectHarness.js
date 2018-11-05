const util = require('util')
const stream = require('stream')

const pipeline = util.promisify(stream.pipeline)

class DirectHarness {
  register(graph) {
    this.graph = graph
    return this
  }

  processBundle() {
    return pipeline(...this.graph)
  }
}

module.exports = DirectHarness
