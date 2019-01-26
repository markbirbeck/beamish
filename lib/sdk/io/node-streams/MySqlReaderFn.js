const debug = require('debug')('MySqlReaderFn')
const DoFn = require('./../../harnesses/node-streams/DoFn')

class MySqlReaderFn extends DoFn {
  constructor(config) {
    debug('constructor (', config, ')')
    super()
    this.config = config
  }

  setup() {
    debug('setup (start)')
    const mysql = require('mysql')
    this.connection = mysql.createConnection(this.config.connection)
    this.connection.connect()
    debug(`query: ${JSON.stringify(this.config.query)}`)
    this.stream = this.connection.query(this.config.query).stream()
    debug('setup (end)')
  }

  async finishBundle() {
    await this.stream.destroy()
  }

  async teardown() {
    await this.connection.end()
  }
}

module.exports = MySqlReaderFn
