/**
 * This should be factored away into Pipeline.js.
 * @module
 */
const debug = require('debug')
const Pipeline = require('./Pipeline');

class NodeStreamsPipeline extends Pipeline {
  constructor(options = {}) {
    super({
      runner: 'node-streams/NodeStreamsRunner',
      ...options
    })
    this.graph = []
  }

  apply(name, root) {
    if (typeof name === 'object') {
      root = name
      name = 'UndefinedNamePipelineApply'
    }
    /**
     * Add the name to the transform:
     */
    root.name = name
    /**
     * Add a debug logging function:
     */
    root.debug = debug(name)

    return Pipeline.applyTransform(name, this, root)
  }

  getPipeline() {
    return this
  }

  applyInternal(name, input, transform) {
    /**
     * If the transform has an expand() method then use it, otherwise
     * just add the transform to the graph:
     */
    if (transform.expand) {
      transform.expand(this)
    } else {
      this.graph.push(transform)
    }
    return this
  }
}

exports.create = options => new NodeStreamsPipeline(options)
