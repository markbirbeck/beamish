/**
 * @module
 */
const debug = require('debug')('Pipeline')

class Pipeline {
  constructor(options) {
    this.options = {
      runner: 'node-streams/NodeStreamsRunner',
      ...options
    }
    this.graph = []
  }

  apply(transform) {
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
