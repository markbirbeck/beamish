/**
 * NOTE: In Beam this inherits from Serialize since in order to serialise
 * DoFn's their containers need to be serializable. However, we don't have
 * that requirement.
 */

class PTransform { }

module.exports = PTransform;
