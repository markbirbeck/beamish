/**
 * Pipeline.
 * Factoring DirectRunnerPipeline and NodeStreamsPipeline into here.
 * @module
 */
const debug = require('debug')('Pipeline')
const TransformHierarchy = require('./runners/TransformHierarchy');

class Pipeline {
  constructor(options = {}) {
    this.options = {
      runner: 'direct/DirectRunner',
      ...options
    };
    this.transforms = new TransformHierarchy();
  }

  run() {
    const runnerClass = require(`../runners/${this.options.runner}`);
    const runner = new runnerClass();

    return runner.run(this);
  }

  /**
   * Returns a {@link PBegin} owned by this Pipeline. This serves as the input of a root {@link
   * PTransform} such as {@link Read} or {@link Create}.
   */

  begin() {
    return PBegin.in(this);
  }

  /**
   * Adds a root {@link PTransform}, such as {@link Read} or {@link Create}, to this {@link
   * Pipeline}.
   *
   * <p>The node in the {@link Pipeline} graph will use the provided {@code name}. This name is used
   * in various places, including the monitoring UI, logging, and to stably identify this node in
   * the {@link Pipeline} graph upon update.
   *
   * <p>Alias for {@code begin().apply(name, root)}.
   */

  apply(name, root) {
    if (typeof name === 'object') {
      root = name;
      name = 'UndefinedNamePipelineApply'
    }
    return this.begin().apply(name, root)
  }

  applyInternal(name, input, transform) {
    // debug(`Adding ${JSON.stringify(transform)} to ${JSON.stringify(this)}`)
    this.transforms.pushNode()

    /**
     * An expand() method allows a single step to be mapped to a collection
     * of steps:
     */

    try {
      const output = transform.expand(input)
      this.transforms.setOutput(output)

      return output
    } finally {
      this.transforms.popNode()
    }
  }

  static applyTransform (name, input, transform) {
    return input.getPipeline().applyInternal(name, input, transform)
  }

  static create(options) {
    return new Pipeline(options);
  }
}

module.exports = Pipeline

const PBegin = require('./values/PBegin')
