class Serializable {
  init(props) {
    const SerializableUtils = require('./SerializableUtils');

    Object.entries(props).forEach(([key, value]) => {
      if (typeof value === 'string' && value.substring(0, 4) === 'new ') {
        this[key] = SerializableUtils.deserialize(value);
      } else {
        this[key] = value;
      }
    });
    return this;
  }
}

module.exports = Serializable;
