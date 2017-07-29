const PTransform = require('./PTransform');

class ParDo extends PTransform {
  of(obj) {
    this._obj = obj;

    return this;
  }

  apply() {
    return this._obj.serialize();
  }
}

module.exports = () => new ParDo();
