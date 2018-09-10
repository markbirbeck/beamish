const TransformHierarchy = require('./runners/TransformHierarchy');

class Pipeline {
  constructor(options) {
    this.options = options || { runner: 'direct/DirectRunner' };
    this.transforms = new TransformHierarchy();
  }

  apply(name, obj) {
    if (typeof name === 'object') {
      obj = name;
      name = 'Unnamed';
    }

    /**
     * An expand() method allows a single step to be mapped to a collection
     * of steps:
     *
     * TODO: This is the wrong way around, in that the node should be pushed
     * first, and then expanded. However, until we return a PCollection rather
     * than this pipeline, we can't do this properly, since we'll just recurse.
     */

    try {
      obj.expand(this)
    } catch(e) {
      this.transforms.pushNode(obj);
    }

    /**
     * Return the pipeline so that apply() statements can be chained:
     *
     * [TODO] This should actually return a PCollection.
     */

    return this;
  }

  run() {
    const runnerClass = require(`../runners/${this.options.runner}`);
    const runner = new runnerClass();

    return runner.run(this);
  }
}

exports.create = (options) => new Pipeline(options);
