const DoFn = require('./../../harnesses/node-streams/DoFn')

class MySqlReaderFn extends DoFn {
  constructor(config) {
    super()
    this.config = config
  }

  setup() {
    const mysql = require('mysql')
    this.connection = mysql.createConnection(this.config.connection)
    this.connection.connect()
    this.stream = this.connection.query(this.config.query).stream()
  }

  async finishBundle() {
    await this.stream.destroy()
  }

  async teardown() {
    await this.connection.end()
  }
}

module.exports = MySqlReaderFn
