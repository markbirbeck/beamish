const SerializableUtils = require('../util/SerializableUtils');

class TransformHierarchy {
  constructor() {
    this.graph = [];
  }

  pushNode(transform) {
    const serialized = SerializableUtils.serialize(transform.fn);

    /**
     * Can now save the serialized form to the graph:
     *
     * [TODO]: Eventually need to save the original class so that we can
     * chain properly and do graph modifications. We'll just serialize
     * later in the process.
     */

    this.graph.push(serialized);
  }
}

module.exports = TransformHierarchy;
