const serialize = require('serialize-javascript');
const Serializable = require('../io/Serializable');

class SerializableUtils {
  static serialize(value) {

    /**
     * Ensure that the object is serializable:
     */

    if (!value instanceof Serializable) {
      console.error('value is not from Serializable');
      throw new Error(
        `Class '${value.constructor.name}' must inherit from Serializable`);
    }

    return `new ${serialize(value.constructor)}().init(${serialize(value)})`;
  }
}

module.exports = SerializableUtils;
