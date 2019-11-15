/**
 * This should be factored away into Pipeline.js.
 * @module
 */
const debug = require('debug')
const { Pipeline } = require('./Pipeline');

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
    /**
     * If the transform has an expand() method then use it, otherwise
     * just add the transform to the graph:
     */
    if (root.expand) {
      root.expand(this)
    } else {
      this.graph.push(root)
    }
    return this
  }
}

exports.create = options => new NodeStreamsPipeline(options)
