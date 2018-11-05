const DoFn = require('./../../harnesses/node-streams/DoFn')

class SplitNewLineFn extends DoFn {
  setup() {
    this.last = ''
  }

  processElement(c) {

    /**
     * Add any leftovers from previous processing to the front of
     * the new data:
     */

    this.last += c.element()

    /**
     * Split the data; we're looking for '\r', '\n', or '\r\n':
     */

    const list = this.last.split(/\r\n|[\r\n]/)

    /**
     * Save the very last entry for next time, since we don't know
     * whether it's a full line or not:
     */

    this.last = list.pop()

    while (list.length) {
      c.output(list.shift())
    }
  }

  finishBundle(fbc) {
    fbc.output(this.last)
  }
}

module.exports = SplitNewLineFn
