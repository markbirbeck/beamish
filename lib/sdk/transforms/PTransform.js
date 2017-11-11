/**
 * NOTE: In Beam this inherits from Serialize since in order to serialise
 * DoFn's their containers need to be serializable. However, we don't have
 * that requirement.
 */

const Serializable = require('../io/Serializable');

class PTransform extends Serializable { }

module.exports = PTransform;
