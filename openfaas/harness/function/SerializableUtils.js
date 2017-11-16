const serialize = require('serialize-javascript');
const Serializable = require('./Serializable');

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
    const BoundedSource = require('./BoundedSource');
    const DoFn = require('./DoFn');
    const PTransform = require('./PTransform');

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
