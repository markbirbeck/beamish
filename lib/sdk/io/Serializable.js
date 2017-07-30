const serialize = require('serialize-javascript');

class Serializable {
  serialize() {
    return serialize(this.constructor);
  }
};

module.exports = Serializable;
