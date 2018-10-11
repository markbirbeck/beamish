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
      if (!this.connection) {
        resolve()
      } else {
        /**
         * Wipe out the reference to the connection so that we don't
         * get two closes in progress at the same time:
         */

        const connection = this.connection
        this.connection = null

        connection.end(err => {
          if (err) {
            reject(`Error closing MySQL connection: ${err}`)
          } else {
            debug('Connection has now closed')
            resolve()
          }
        })
      }
    })
  }
}

module.exports = MySqlConnection
