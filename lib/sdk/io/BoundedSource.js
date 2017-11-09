const Source = require('./Source');

class BoundedReader extends Source.Reader { }

class BoundedSource extends Source {
  createReader() {
    throw new Error('createReader() not implemented');
  }

  static get BoundedReader() { return BoundedReader; }
}

module.exports = BoundedSource;
