const TransformHierarchy = require('./TransformHierarchy');

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
}

exports.create = () => new Pipeline();
