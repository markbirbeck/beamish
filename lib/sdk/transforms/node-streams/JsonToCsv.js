const DoFn = require('./../../harnesses/direct/DoFn')

class JsonToCsv extends DoFn {
  constructor(headers) {
    super()
    this.headers = headers
  }

  setup() {
    /**
     * Create a JSON parser. We want all values from all levels, so
     * we specify flatten = true. We're also not bothered about the
     * headers because we're only parsing one line at a time, and if
     * header=true, we'll get the header values repeated every time:
     */
    const JsonToCsvParser = require('json2csv').Parser

    /**
     * For a full list of options see:
     *
     *  https://www.npmjs.com/package/json2csv#available-options
     */
    this.parser = new JsonToCsvParser({
      flatten: true,
      header: false
    })
    this.headersSent = false
  }

  processElement(c) {
    /**
     * If this is the first time through then we may need to send
     * the headers (if there are any):
     */
    if (!this.headersSent) {
      if (this.headers) {
        c.output(this.headers)
      }
      this.headersSent = true
    }
    const input = c.element()
    c.output(this.parser.parse(input))
  }
}

module.exports = JsonToCsv
