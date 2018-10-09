const ResultSet = require('./ResultSet')

class PrepareStatement {
  constructor(connection, query, nestTables) {
    this.connection = connection
    this.query = query
    this.nestTables = nestTables
  }

  executeQuery() {
    return new ResultSet(this.connection, this.query, this.nestTables)
  }
}

module.exports = PrepareStatement
