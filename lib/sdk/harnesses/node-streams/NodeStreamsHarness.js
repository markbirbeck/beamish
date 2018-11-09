const util = require('util')
const stream = require('stream')

const pipeline = util.promisify(stream.pipeline)

const DoFnAsReadable = require('./DoFnAsReadable')
const DoFnAsTransform = require('./DoFnAsTransform')
const DoFnAsWritable = require('./DoFnAsWritable')

class NodeStreamsHarness {
  register(graph) {
    const source = new DoFnAsReadable(graph.shift())
    const sink = new DoFnAsWritable(graph.pop())
    const transforms = graph.map(transform => new DoFnAsTransform(transform))

    this.graph = [
      source,
      ...transforms,
      sink
    ]
    return this
  }

  processBundle() {
    return pipeline(...this.graph)
  }
}

module.exports = NodeStreamsHarness
