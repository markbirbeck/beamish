const debug = require('debug')('MySqlIO:ResultSet')

class ResultSet {
  constructor(connection, query, nestTables) {
    this.connection = connection
    this.query = query
    this.nestTables = nestTables
    this.started = false
    this.offset = 0
    this.fetchSize = 50000
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

    const query = `${q} LIMIT ${this.offset},${this.fetchSize};`

    /**
     * Return the results by way of a promise:
     */

    return new Promise((resolve, reject) => {
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

    if (!this.started) {
      this.started = true
      this.buffer = await this.fetch()
      this.row = 0
    }
    this.row++
    available = this.row <= this.buffer.length
    return available
  }

  getCurrent() {
    return this.buffer[this.row - 1]
  }
}

module.exports = ResultSet
