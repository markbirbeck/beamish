/**
 * The DoFn module is not referenced in this file but it will be referenced
 * by the user-defined classes that we're running:
 */

const SerializableUtils = require('../../util/SerializableUtils');
const Serializable = require('../../io/Serializable');

class PTransform extends Serializable {
  constructor(source) {
    super();
    return SerializableUtils.deserialize(source);
  }
};

module.exports = PTransform;
