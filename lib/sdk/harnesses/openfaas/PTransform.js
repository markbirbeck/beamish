/**
 * The DoFn module is not referenced in this file but it will be referenced
 * by the user-defined classes that we're running:
 */

const SerializableUtils = require('./SerializableUtils');
const Serializable = require('./Serializable');

class PTransform extends Serializable {
  constructor(source) {
    super();
    return SerializableUtils.deserialize(source);
  }
};

module.exports = PTransform;
