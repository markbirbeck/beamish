/**
 * @module
 */
const debug = require('debug')

class Pipeline {
  constructor(options) {
    this.options = {
      runner: 'node-streams/NodeStreamsRunner',
      ...options
    }
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
    this.graph.push(transform)
    return this
  }

  run() {
    const runnerClass = require(`../runners/${this.options.runner}`)
    const runner = new runnerClass()

    return runner.run(this)
  }
}

exports.create = options => new Pipeline(options)
