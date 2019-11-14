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

  apply(name, transform) {
    /**
     * If a name for the transform has not been provided then set a
     * default value:
     */
    if (typeof name === 'object') {
      transform = name
      name = 'UndefinedNamePipelineApply'
    }
    /**
     * Add the name to the transform:
     */
    transform.name = name
    /**
     * Add a debug logging function:
     */
    transform.debug = debug(name)
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
