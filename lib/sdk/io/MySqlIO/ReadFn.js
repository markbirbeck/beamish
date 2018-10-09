const DoFn = require('../../transforms/DoFn')

class ReadFn extends DoFn {
  constructor(configuration, query, nestTables) {
    super()
    this.configuration = configuration
    this.query = query
    this.nestTables = nestTables
  }

  setup() {
    const MySqlConnection = require('../io/MySqlIO/MySqlConnection')

    const configuration = this.configuration
    const connectionConfiguration = {
      user: configuration.username,
      password: configuration.password,
      host: configuration.dataSource[0],
      database: configuration.dataSource[1]
    }

    debug(`Connecting to stream: ${
      JSON.stringify({
        ...connectionConfiguration,
        password: '*****'
      })
    }`)
    this.connection = new MySqlConnection(connectionConfiguration)
  }

  async processElement(c) {
    debug(`Creating stream with query: ${this.query}`)
    const statement = this.connection.prepareStatement(this.query, this.nestTables)
    const resultSet = statement.executeQuery()

    while (await resultSet.next()) {
      c.output(resultSet.getCurrent())
    }
  }

  teardown() {
    this.connection.close();
  }
}

module.exports = ReadFn
