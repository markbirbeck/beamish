/**
 * NOTE: In Beam this inherits from Serialize since in order to serialise
 * DoFn's their containers need to be serializable. However, we don't have
 * that requirement.
 */

const Serializable = require('../io/Serializable');

class PTransform extends Serializable {
  /**
   * Override this method to specify how this {@code PTransform} should be expanded on the given
   * {@code InputT}.
   *
   * <p>NOTE: This method should not be called directly. Instead apply the {@code PTransform} should
   * be applied to the {@code InputT} using the {@code apply} method.
   *
   * <p>Composite transforms, which are defined in terms of other transforms, should return the
   * output of one of the composed transforms. Non-composite transforms, which do not apply any
   * transforms internally, should return a new unbound output and register evaluators (via
   * backend-specific registration methods).
   */
  expand(/*input*/) {
    throw new Error(`expand() has not been implemented in ${this.constructor.name}`)
  }

}

module.exports = PTransform;
