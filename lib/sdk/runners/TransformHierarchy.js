const serialize = require('serialize-javascript');

class TransformHierarchy {
  constructor() {
    this.graph = [];
  }

  pushNode(transform) {
    const fn = transform.fn;
    const serialized = `new ${serialize(fn.constructor)}().init(${serialize(fn)})`;

    this.graph.push(serialized);
  }
}

module.exports = TransformHierarchy;
