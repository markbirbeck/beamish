const DoFn = require('../../transforms/DoFn')
const { serialize } = require('../../util/SerializableUtils');

class ReadFn extends DoFn {
  constructor(dataSourceConfiguration, query, nestTables) {
    super()
    /**
     * TODO(MB): This is temporary until the serialization routines properly
     * handle nested classes:
     */

    this.dataSourceConfiguration = serialize(dataSourceConfiguration)
    this.query = query
    this.nestTables = nestTables
  }

  setup() {
    this.dataSource = this.dataSourceConfiguration.buildDataSource()
    this.connection = this.dataSource.getConnection()
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
    this.dataSource.close()
  }
}

module.exports = ReadFn
