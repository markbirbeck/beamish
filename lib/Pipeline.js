const TransformHierarchy = require('./TransformHierarchy');

class Pipeline {
  constructor() {
    this.transform = new TransformHierarchy();
  }

  apply(obj) {
    this.transform.pushNode(obj);

    /**
     * Return the pipeline so that apply() statements can be chained:
     */

    return this;
  }
}

exports.create = () => new Pipeline();
