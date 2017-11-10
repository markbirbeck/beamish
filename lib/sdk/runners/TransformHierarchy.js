const serialize = require('serialize-javascript');
const Serializable = require('../io/Serializable');

class TransformHierarchy {
  constructor() {
    this.graph = [];
  }

  pushNode(transform) {
    const fn = transform.fn;

    /**
     * Ensure that the function is serializable:
     */

    if (!fn instanceof Serializable) {
      throw new Error(
        `Class '${fn.constructor.name}' must inherit from Serializable`);
    }

    const serialized = `new ${serialize(fn.constructor)}().init(${serialize(fn)})`;

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
