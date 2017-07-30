class TransformHierarchy {
  constructor() {
    this.graph = [];
  }

  pushNode(transform) {
    this.graph.push(transform.apply());
  }
}

module.exports = TransformHierarchy;
