const serialize = require('serialize-javascript');

class Serializable {
  serialize() {
    return `new ${serialize(this.constructor)}(${serialize(this)})`;
  }
};

module.exports = Serializable;
