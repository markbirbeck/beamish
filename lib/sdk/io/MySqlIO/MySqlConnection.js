const debug = require('debug')('MySqlIO:MySqlConnection')
const PrepareStatement = require('./PrepareStatement')

class MySqlConnection {
  constructor(options) {
    const mysql = require('mysql')
    this.connection = mysql.createConnection(options)
  }

  prepareStatement(query, nestTables) {
    return new PrepareStatement(this.connection, query, nestTables)
  }

  close() {
    return new Promise((resolve, reject) => {
      this.connection.end(err => {
        if (err) {
          reject(`Error closing MySQL connection: ${err}`)
        } else {
          debug('Connection has now closed')
          resolve()
        }
      })
    })
  }
}

module.exports = MySqlConnection
