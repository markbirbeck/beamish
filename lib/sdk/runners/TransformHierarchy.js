const SerializableUtils = require('../util/SerializableUtils');

class TransformHierarchy {
  constructor() {
    this.graph = [];
  }

  pushNode() { }

  setOutput(output) {
    const serialized = SerializableUtils.serialize(output.fn);

    /**
     * Can now save the serialized form to the graph:
     *
     * [TODO]: Eventually need to save the original class so that we can
     * chain properly and do graph modifications. We'll just serialize
     * later in the process.
     */

    this.graph.push(serialized);
  }

  popNode() { }
}

module.exports = TransformHierarchy;
