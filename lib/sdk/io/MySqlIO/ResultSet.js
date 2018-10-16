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
    this.timeout = 5 * 60000
  }

  async fetch() {

    /**
     * Increase the server-side timeout:
     */

    await this.doQuery({sql: `SET SESSION MAX_EXECUTION_TIME=${this.timeout};`})

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
     * Note that the client-side timeout needs to be at least as great as the
     * server-side timeout:
     */

    return this.doQuery({
      sql: query,
      timeout: this.timeout,
      nestTables: this.nestTables
    })
  }

  doQuery(query) {

    /**
     * Return the results by way of a promise:
     */

    return new Promise((resolve, reject) => {
      debug(`About to query: ${query}`)
      this.connection
      .query(query, (error, results, fields) => {
        if (error) reject(error)
        else resolve(results)
      })
    })
  }

  async next() {
    let available = true

    if (this.row === this.buffer.length) {
      this.buffer = await this.fetch()
      debug(`Retrieved ${this.buffer.length} results`)
      this.row = 0
    }
    this.row++
    this.offset++
    if (this.row > this.buffer.length || this.offset > this.maxRows) {
      available = false
      debug('No more rows available')
    }
    return available
  }

  getCurrent() {
    return this.buffer[this.row - 1]
  }
}

module.exports = ResultSet
