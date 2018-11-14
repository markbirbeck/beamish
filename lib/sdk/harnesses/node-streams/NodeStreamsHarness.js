const debug = require('debug')('NodeStreamsHarness')
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

  async processBundle() {
    let transform
    debug('setup')
    for (transform of this.graph) {
      await transform.fn.setup()
    }

    debug('processElement')
    await pipeline(...this.graph)

    debug('teardown')
    for (transform of this.graph) {
      await transform.fn.teardown()
    }
  }
}

module.exports = NodeStreamsHarness
