const DoFn = require('./DoFn');
const ParDo = require('../transforms/ParDo');
const PTransform = require('./PTransform');

/**
 * [TODO] This should be based on PTransform.
 */

class MapElements extends PTransform {
  static via(doFn) {
    return ParDo().of(doFn);
  }
}

module.exports = MapElements;
