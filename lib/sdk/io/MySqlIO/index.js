const ParDo = require('../../transforms/ParDo')
const PTransform = require('../../transforms/PTransform');
const ReadFn = require('./ReadFn')

class Read extends PTransform {
  withDataSourceConfiguration(configuration) {
    this.configuration = configuration
    return this
  }

  withNestTables(nestTables=true) {
    this.nestTables = nestTables;
    return this;
  }

  withQuery(query) {
    this.query = query;
    return this;
  }

  expand(input) {
    return input.apply(
      ParDo.of(
        new ReadFn(
          this.configuration,
          this.query,
          this.nestTables
        )
      )
    )
  }
}

class Builder {
  setNestTables(nestTables=true) {
    this.nestTables = nestTables
    return this
  }

  build() {
    return new Read()
  }
}

class MySqlIO {
  static read() {
    return new Builder().setNestTables(false).build()
  }
};

MySqlIO.DataSourceConfiguration = require('./DataSourceConfiguration')

module.exports = MySqlIO;
