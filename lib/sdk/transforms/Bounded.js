const DoFn = require('./DoFn');

/**
 * [TODO] Should be based on PTransform not DoFn.
 */

class Bounded extends DoFn {
  constructor(name, source) {
    super();
    this.source = source;
  }
}

module.exports = Bounded;
