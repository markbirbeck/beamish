class DoFn {
  constructor(objectMode=true) {
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
