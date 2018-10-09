const debug = require('debug')('MySqlIO:DataSource')
const MySqlConnection = require('./MySqlConnection')

class MySqlDataSource {
  constructor(configuration) {
    this.options = {
      user: configuration.username,
      password: configuration.password,
      host: configuration.dataSource[0],
      database: configuration.dataSource[1]
    }
    this.connection = null
  }

  getConnection() {
    if (!this.connection) {
      debug(`Connecting to stream: ${
        JSON.stringify({
          ...this.options,
          password: '*****'
        })
      }`)
      this.connection = new MySqlConnection(this.options)
    }
    return this.connection
  }

  close() {
    return this.connection.close()
  }
}

module.exports = MySqlDataSource
