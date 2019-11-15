/**
 * @module
 */
/**
 * {@link PBegin} is the "input" to a root {@link PTransform}, such as {@link Read
 * Read} or {@link org.apache.beam.sdk.transforms.Create}.
 *
 * <p>Typically elided by simply calling {@link Pipeline#apply(String, PTransform)}
 * or {@link Pipeline#apply(PTransform)}, but one can be explicitly created by
 * calling {@link Pipeline#begin} on a Pipeline.
 */
const debug = require('debug')('PBegin')

class PBegin {

  /**
   * @param {module:Pipeline.Pipeline} pipeline
   */
  constructor(pipeline) {
    this.pipeline = pipeline
  }

  getPipeline() {
    return this.pipeline
  }

  /**
   * Applies the given {@link PTransform} to this {@link PBegin}, using {@code name}
   * to identify this specific application of the transform.
   *
   * <p>This name is used in various places, including the monitoring UI, logging,
   * and to stably identify this application node in the job graph.
   */

  apply(name, t) {
    if (typeof name === 'object') {
      t = name
      name = 'UndefinedNamePBeginApply'
    }
    debug('About to call Pipeline.applyTransform')
    return Pipeline.applyTransform(name, this, t)
  }
}

/** Returns a {@link PBegin} in the given {@link Pipeline}. */
/**
 * @param {module:Pipeline.Pipeline} pipeline
 */
exports.in = (pipeline) => {
  return new PBegin(pipeline)
}

const Pipeline = require('../Pipeline')
