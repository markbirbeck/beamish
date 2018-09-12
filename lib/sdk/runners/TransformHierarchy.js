const { checkState } = require('../util/Preconditions')
const SerializableUtils = require('../util/SerializableUtils');

class Node {
  constructor(enclosingNode) {
    this.enclosingNode = enclosingNode
    this.outputs = null
    this.parts = []
  }

  /** Returns the enclosing composite transform node, or null if there is none. */
  getEnclosingNode() {
    return this.enclosingNode
  }

  /**
   * Adds a composite operation to the transform node.
   *
   * <p>As soon as a node is added, the transform node is considered a composite
   * operation instead of a primitive transform.
   */

  addComposite(node) {
    this.parts.push(node)
  }

  setOutput(output) {
    const serialized = SerializableUtils.serialize(output.expand().fn);

    this.outputs = serialized
  }
}

class TransformHierarchy {
  constructor() {
    this.root = new Node()
    this.current = this.root
  }

  pushNode() {
    const node = new Node(this.current)
    this.current.addComposite(node)
    this.current = node
    return this.current
  }

  setOutput(output) {
    this.current.setOutput(output)
  }

  popNode() {
    this.current = this.current.getEnclosingNode()
    checkState(this.current !== undefined,
      'Can\'t pop the root node of a TransformHierarchy')
  }
}

module.exports = TransformHierarchy;
