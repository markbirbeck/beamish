const NodeStreamHarness = require('../../sdk/harnesses/node-streams/NodeStreamsHarness')
const PipelineRunner = require('../../sdk/PipelineRunner')

class NodeStreamsRunner extends PipelineRunner {
  constructor() {
    super()
    this.harness = new NodeStreamHarness()
  }

  run(pipeline) {
    this.harness.register(pipeline.graph)
    return this
  }

  waitUntilFinish() {
    return this.harness.processBundle()
  }
}

module.exports = NodeStreamsRunner
