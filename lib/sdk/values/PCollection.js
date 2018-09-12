const { checkState } = require('../util/Preconditions')
const IPValueBase = require('./IPValueBase')

class PCollection extends IPValueBase {
  constructor(pipeline, fn) {
    super(pipeline)
    this.fn = fn
  }

  expand() {
    return this
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
      name = 'UndefinedNamePCollectionApply'
    }
    return Pipeline.applyTransform(name, this, t)
  }
}

exports.createPrimitiveOutputInternal = (pipeline, fn) => new PCollection(pipeline, fn)

const Pipeline = require('../Pipeline')
