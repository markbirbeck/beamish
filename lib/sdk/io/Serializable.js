class Serializable {
  /**
   * init() is executed in the runner so include any modules that are needed
   * at execution time.
   */

  init(props) {
    const BoundedSource = require('./BoundedSource');

    Object.entries(props).forEach(([key, value]) => {
      if (typeof value === 'string' && value.substring(0, 4) === 'new ') {
        this[key] = eval(`${value}`);
      } else {
        this[key] = value;
      }
    });
    return this;
  }
}

module.exports = Serializable;
