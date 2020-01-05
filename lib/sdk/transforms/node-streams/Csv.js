const DoFn = require('./../../harnesses/direct/DoFn')

class Csv extends DoFn {
  constructor(columns) {
    super()
    this.columns = columns
  }

  setup() {

    /**
     * For a full list of possible options see:
     *
     *  http://csv.adaltas.com/parse/
     */

    this.options = {
      columns: this.columns,
      comment: '#',
      trim: true
    }
    this.parse = require('csv-parse/lib/sync')
  }

  processElement(c) {

    /**
     * Get the input:
     */

    const line = c.element()

    /**
     * If we're hoping to do 'autodiscovery' on the columns then use
     * the first line as the column names:
     */

    if (this.options.columns === true) {

      /**
       * Don't factor the parsing line below since it must be performed
       * AFTER setting the columns option to null so that we get the
       * headings:
       */

      this.options.columns = null
      this.options.columns = this.parse(line, this.options)[0]
    } else {

      /**
       * Check the parsed result before outputting since it may be
       * a comment; they come back as 'undefined':
       */

      try {
        const parsed = this.parse(line, this.options)
        if (parsed.length) {
          c.output(parsed[0])
        }
      } catch(err) {
        console.error(`failed to parse: '${line}'`)
        console.error(err)
      }
    }
  }
}

module.exports = Csv
