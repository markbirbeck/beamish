/**
 * TODO: This actually has no effect in NodeStreams world, but
 * we're adding it here to help refactoring.
 */
const Serializable = require('../../io/Serializable');

class DoFn extends Serializable {
  /**
   * TODO: This only has an effect in NodeStreams world, so
   * will probably be removed when harmonising is complete.
   */
  constructor(objectMode=true) {
    super()
    this.objectMode = objectMode
  }

  processElement(c) {
    /**
     * If the derived class does not provide a processElement() method then the
     * default behaviour is to forward on the result of passing the input to an
     * apply() method:
     */
    c.output(this.apply(c.element()))
  }

  apply() {
    /**
     * If we get here then then the derived class has provided *neither* an apply()
     * method *nor* a processElement() method:
     */
    throw new Error('apply() not implemented or processElement() not overridden')
  }
}

module.exports = DoFn
