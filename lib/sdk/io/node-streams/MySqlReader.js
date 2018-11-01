const DoFn = require('./../../harnesses/node-streams/DoFn')

class MySqlReader extends DoFn {
  constructor(config) {
    super()
    this.config = config

    /**
     * Set an objectMode flag so that DoFnAsReadable can set itself up
     * correctly:
     */

    this.objectMode = true
  }

  setup() {
    const mysql = require('mysql')
    this.connection = mysql.createConnection(this.config.connection)
    this.connection.connect()
    this.stream = this.connection.query(this.config.query).stream()
  }

  async teardown() {
    await this.stream.destroy()
    await this.connection.end()
  }
}

module.exports = MySqlReader
