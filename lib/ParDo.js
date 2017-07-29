const serialize = require('serialize-javascript');

class ParDo {
  of(obj) {
    this._obj = obj;

    return this;
  }

  apply() {
    return serialize(this._obj);
  }
}

module.exports = () => new ParDo();
