const DirectRunner = require('../runners/grpc/GrpcRunner');
const TransformHierarchy = require('./runners/TransformHierarchy');

class Pipeline {
  constructor() {
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
    const runner = new DirectRunner();

    return runner.run(this);
  }
}

exports.create = () => new Pipeline();
