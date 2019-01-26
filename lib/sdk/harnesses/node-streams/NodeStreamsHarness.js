const debug = require('debug')('NodeStreamsHarness')
const util = require('util')
const stream = require('stream')

const pipeline = util.promisify(stream.pipeline)

const DoFnAsDuplex = require('./DoFnAsDuplex')
const DoFnAsReadable = require('./DoFnAsReadable')
const DoFnAsTransform = require('./DoFnAsTransform')
const DoFnAsWritable = require('./DoFnAsWritable')

class NodeStreamsHarness {
  register(graph) {
    this.graph = graph
    return this
  }

  async processBundle() {
    const g = this.graph

    /**
     * Go through all of the nodes and call their setup() functions if
     * present. We do this first because a node may create a stream and
     * we'll need to wire that in:
     */
    let transform
    debug('setup')
    for (transform of g) {
      if (transform.setup) {
        await transform.setup()
      }
    }

    /**
     * We now have a collection of nodes, each of which is either a
     * 'pure' Node stream, or an object that contains a 'stream' property
     * that refers to a 'pure' Node stream. Anything that is a 'pure'
     * stream object can be passed to Node, but anything that is a DoFn
     * needs to be wrapped in a class that implements the relevant type
     * of stream (Readable, Writables, Duplex, or Transform):
     */
    const graph = g.map((transform, index) => {
      /**
       * Check the first node and ensure it's a source, or a DoFn with a source:
       */
      if (index === 0) {
        debug(`adding Readable: ${transform.name || transform.constructor.name}`)
        if (transform instanceof stream.Readable) {
          return transform
        }

        if (transform.fn && (transform.fn.stream instanceof stream.Readable || transform.fn.stream.constructor.name === 'Readable')) {
          return new DoFnAsReadable(transform)
        }

        /**
         * TODO(MB): Insert a stdin stream.
         */
        throw new Error('First node in graph must be either a Readable stream or a DoFn')
      }

      /**
       * Check the last node and ensure it's a sink, or a DoFn with a sink:
       */
      if (index === g.length - 1) {
        debug(`adding Writable: ${transform.name || transform.constructor.name}`)
        if (transform instanceof stream.Writable) {
          return transform
        }

        if (transform.fn && (transform.fn.stream instanceof stream.Writable)) {
          return new DoFnAsWritable(transform)
        }

        /**
         * TODO(MB): Insert a stdout stream.
         */
        throw new Error('Last node in graph must be either a Writable stream or a DoFn')
      }

      /**
       * Ensure that each of the middle steps is either a transform or duplex stream:
       */
      debug(`adding Transform: ${transform.name || transform.constructor.name}`)
      if (transform instanceof stream.Duplex || transform instanceof stream.Transform) {
        return transform
      }

      if (transform.fn && (transform.fn.stream instanceof stream.Duplex)) {
        return new DoFnAsDuplex(transform)
      }

      if (transform.fn && (transform.fn.stream instanceof stream.Transform) ||
        transform.fn.stream === undefined) {
        return new DoFnAsTransform(transform)
      }

      throw new Error('Middle nodes in graph must be one of: a Transform stream, a Duplex stream, or a DoFn')
    })

    debug('processElement')
    await pipeline(...graph)

    debug('teardown')
    for (transform of g) {
      if (transform.teardown) {
        await transform.teardown()
      }
    }
    debug('done processBundle')
  }
}

module.exports = NodeStreamsHarness
