const debug = require('debug')('NodeStreamsHarness')
const util = require('util')
const stream = require('stream')

const pipeline = util.promisify(stream.pipeline)

const DoFnAsReadable = require('./DoFnAsReadable')
const DoFnAsTransform = require('./DoFnAsTransform')
const DoFnAsWritable = require('./DoFnAsWritable')

class NodeStreamsHarness {
  register(graph) {
    /**
     * Check the first node and ensure it's a source:
     */

    let source = graph.shift()

    if (!(source instanceof stream.Readable)) {
      if (source.fn) {
        source = new DoFnAsReadable(source)
      } else {
        throw new Error('First node in graph must be either a Readable stream or a DoFn')
      }
    }

    /**
     * Check the last node and ensure it's a sink:
     */

    let sink = graph.pop()

    if (!(sink instanceof stream.Writable)) {
      if (sink.fn) {
        sink = new DoFnAsWritable(sink)
      } else {
        throw new Error('Last node in graph must be either a Writable stream or a DoFn')
      }
    }

    /**
     * Now ensure that each remaining step is a transform or duplex stream:
     */

    const transforms = graph.map(transform => {
      debug(`adding transform: ${transform.constructor.name}`)
      if (!(transform instanceof stream.Transform) && !(transform instanceof stream.Duplex)) {
        if (transform.fn) {
          transform = new DoFnAsTransform(transform)
        } else {
          throw new Error('Middle nodes in graph must be one of: a Transform stream, a Duplex stream, or a DoFn')
        }
      }
      return transform
    })

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
      if (transform.fn) {
        await transform.fn.setup()
      }
    }

    debug('processElement')
    await pipeline(...this.graph)

    debug('teardown')
    for (transform of this.graph) {
      if (transform.fn) {
        await transform.fn.teardown()
      }
    }
  }
}

module.exports = NodeStreamsHarness
