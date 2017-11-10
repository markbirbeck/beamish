const Serializable = require('../io/Serializable');

class Source extends Serializable {
  static get Reader() {
    return class Reader {
      constructor(spec) {
        this.spec = spec;
      }

      start() {
        throw new Error('start() not implemented');
      }

      advance() {
        throw new Error('advance() not implemented');
      }

      getCurrent() {
        throw new Error('getCurrent() not implemented');
      }

      getCurrentTimestamp() {
        throw new Error('getCurrent() not implemented');
      }

      close() {
        throw new Error('close() not implemented');
      }

      getCurrentSource() {
        throw new Error('getCurrentSource() not implemented');
      }
    }
  }
}

module.exports = Source;
