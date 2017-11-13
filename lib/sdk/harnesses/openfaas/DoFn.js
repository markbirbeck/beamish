const Serializable = require('./Serializable');

class DoFn extends Serializable {
  processElement(c) {
    c.output(this.apply(c.element()));
  }

  apply() {
    throw new Error('apply() not implemented or processElement() not overridden');
  }
}

module.exports = DoFn;
