const serialize = require('serialize-javascript');

class Pipeline {
  constructor() {
    this.graph = [];
  }

  apply(obj) {
    this.graph.push(serialize(obj));

    /**
     * Return the pipeline so that apply() statements can be chained:
     */

    return this;
  }
}

exports.create = () => new Pipeline();
