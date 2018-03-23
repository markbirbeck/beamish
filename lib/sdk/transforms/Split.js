const DoFn = require('./DoFn');

class Split extends DoFn {
  processStart() {
    this.last = '';
  }

  processElement(c) {

    /**
     * Add any leftovers from previous processing to the front of
     * the new data:
     */

    this.last += c.element();

    /**
     * Split the data; we're looking for '\r', '\n', or '\r\n':
     */

    const list = this.last.split(/\r\n|[\r\n]/);

    /**
     * Save the very last entry for next time, since we don't know
     * whether it's a full line or not:
     */

    this.last = list.pop();

    /**
     * Propagate all of the lines:
     */

    list.forEach(line => c.output(line));
  }

  processFinish(c) {
    c.output(this.last);
  }
}

module.exports = Split;
