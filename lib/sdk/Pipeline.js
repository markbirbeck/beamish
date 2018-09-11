const debug = require('debug')('Pipeline')
const TransformHierarchy = require('./runners/TransformHierarchy');

class Pipeline {
  constructor(options) {
    this.options = options || { runner: 'direct/DirectRunner' };
    this.transforms = new TransformHierarchy();
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
      name = 'Unnamed';
    }
    return this.begin().apply(name, root)
  }

  applyInternal(name, input, transform) {
    debug(`Adding ${JSON.stringify(transform)} to ${JSON.stringify(this)}`)

    /**
     * An expand() method allows a single step to be mapped to a collection
     * of steps:
     *
     * TODO: This is the wrong way around, in that the node should be pushed
     * first, and then expanded. However, until we return a PCollection rather
     * than this pipeline, we can't do this properly, since we'll just recurse.
     */

    /**
     * TODO: This should pass 'input' rather than 'input.getPipeline()'.
     */

    try {
      transform.expand(input.getPipeline())
    } catch(e) {
      this.transforms.pushNode(transform);
    }

    /**
     * Return the pipeline so that apply() statements can be chained:
     *
     * [TODO] This should actually return a PCollection.
     */

    return input;
  }

  run() {
    const runnerClass = require(`../runners/${this.options.runner}`);
    const runner = new runnerClass();

    return runner.run(this);
  }
}

exports.create = options => new Pipeline(options);

exports.applyTransform = (name, input, transform) => {
  return input.getPipeline().applyInternal(name, input, transform)
}

const PBegin = require('./values/PBegin')
