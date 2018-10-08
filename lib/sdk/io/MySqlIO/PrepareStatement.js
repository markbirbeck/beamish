class PrepareStatement {
  constructor(connection, query, nestTables) {
    this.query = connection
    .query({
      sql: query,
      nestTables
    })
  }

  executeQuery() {
    return this.query.stream()
  }
}

module.exports = PrepareStatement
