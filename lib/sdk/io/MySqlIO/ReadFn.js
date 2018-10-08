const DoFn = require('../../transforms/DoFn')

class ReadFn extends DoFn {
  constructor(configuration, query, nestTables) {
    super()
    this.configuration = configuration
    this.query = query
    this.nestTables = nestTables
  }

  setup() {
    const { MySqlReader } = require('../io/MySqlIO/MySqlSource');
    this.reader = new MySqlReader({
      configuration: this.configuration,
      query: this.query,
      nestTables: this.nestTables
    })
  }

  async processElement(c) {
    let available = await this.reader.start();

    while (available) {
      c.output(this.reader.getCurrent());
      available = await this.reader.advance();
    }
  }

  teardown() {
    this.reader.close();
  }
}

module.exports = ReadFn
