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

  static deserialize(encodedValue) {
    const debug = require('debug')
    const BoundedSource = require('../io/BoundedSource');
    const DoFn = require('../harnesses/direct/DoFn');
    const PTransform = require('../harnesses/direct/PTransform');

    let parsedObject;

    try {
      parsedObject = eval(`(${encodedValue})`);
    } catch(e) {
      throw new Error(`Unable to reflate: "${encodedValue}"\nError: ${e}`);
    }

    return parsedObject;
  }
}

module.exports = SerializableUtils;
