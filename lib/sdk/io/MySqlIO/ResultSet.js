const debug = require('debug')('MySqlIO:ResultSet')

class ResultSet {
  constructor(connection, query, nestTables) {
    this.connection = connection
    this.query = query
    this.nestTables = nestTables
    this.started = false
    this.buffer = []
    this.row = 0
    this.offset = 0
    this.fetchSize = 50000
    this.maxRows = 1000000
  }

  fetch() {
    /**
     * The query will almost certainly have a semi-colon on the end, so remove
     * if so:
     */

    const q = (this.query.endsWith(';')) ? this.query.slice(0, -1) : this.query

    /**
     * Now rebuild the query with a limit and offset:
     */

    const fetchSize = Math.min(this.fetchSize, this.maxRows)
    const query = `${q} LIMIT ${this.offset},${fetchSize};`

    /**
     * Return the results by way of a promise:
     */

    return new Promise((resolve, reject) => {
      debug(`About to query: ${query}`)
      this.connection
      .query({
        sql: query,
        nestTables: this.nestTables
      }, (error, results, fields) => {
        if (error) reject(error)
        else resolve(results)
      })
    })
  }

  async next() {
    let available

    if (this.row === this.buffer.length) {
      this.buffer = await this.fetch()
      debug(`Retrieved ${this.buffer.length} results`)
      this.row = 0
    }
    this.row++
    this.offset++
    available = this.row <= this.buffer.length && this.offset <= this.maxRows
    if (!available) {
      debug('No more rows available')
    }
    return available
  }

  getCurrent() {
    return this.buffer[this.row - 1]
  }
}

module.exports = ResultSet
