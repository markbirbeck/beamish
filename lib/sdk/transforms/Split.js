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

    /**
     * The delimiter is really a line terminator. This means that we'll
     * sometimes get what appears to be an empty line as the final output,
     * and that needs to be suppressed.
     *
     * To explain why, say we have this input:
     *
     *  line 1\n
     *  line 2
     *  EOF
     *
     * It parses to this, which is fine:
     *
     *  [ "line 1", "line 2" ]
     *
     * However, say the input ends with a delimiter, like this:
     *
     *  line 1\n
     *  line 2\n
     *  EOF
     *
     * This would parse to the following (with an extra, empty, line):
     *
     *  [ "line 1", "line 2", "" ]
     *
     * If the delimiter is to treated as a line terminator, then we
     * don't want this final blank line, since we only reallly have
     * two lines. So to get around this we suppress the final output
     * if it's a blank line. (The the only way a blank line can be the
     * last piece of output is if the entire input ends with a
     * delimiter.)
     */

    if (this.last !== '') {
      c.output(this.last);
    }
  }
}

module.exports = Split;
