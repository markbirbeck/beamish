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

    this.transforms.pushNode(obj);

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
