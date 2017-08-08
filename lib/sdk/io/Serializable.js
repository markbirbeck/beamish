const serialize = require('serialize-javascript');

class Serializable {
  serialize() {
    return `new ${serialize(this.constructor)}().init(${serialize(this)})`;
  }
};

module.exports = Serializable;
