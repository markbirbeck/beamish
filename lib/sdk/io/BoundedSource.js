const Source = require('./Source');

class BoundedSource extends Source {
  createReader() {
    throw new Error('createReader() not implemented');
  }

  static get BoundedReader() {
    return class BoundedReader extends Source.Reader { }
  }
}

module.exports = BoundedSource;
