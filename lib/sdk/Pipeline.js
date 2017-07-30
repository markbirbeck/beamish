const DirectRunner = require('../runners/direct/DirectRunner');
const TransformHierarchy = require('./runners/TransformHierarchy');

class Pipeline {
  constructor() {
    this.transforms = new TransformHierarchy();
  }

  apply(obj) {
    this.transforms.pushNode(obj);

    /**
     * Return the pipeline so that apply() statements can be chained:
     */

    return this;
  }

  run() {
    const runner = new DirectRunner();

    return runner.run(this);
  }
}

exports.create = () => new Pipeline();
