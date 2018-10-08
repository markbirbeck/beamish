const ParDo = require('../../transforms/ParDo')
const PTransform = require('../../transforms/PTransform');
const ReadFn = require('./ReadFn')

const hidden = new WeakMap()

class Read extends PTransform {
  constructor(builder) {
    super()
    hidden.set(this, new Map(builder))
  }

  get configuration() {
    return hidden.get(this).get('configuration')
  }

  get nestTables() {
    return hidden.get(this).get('nestTables')
  }

  get query() {
    return hidden.get(this).get('query')
  }

  withDataSourceConfiguration(configuration) {
    return this.toBuilder()
    .setDataSourceConfiguration(configuration)
    .build()
  }

  withNestTables(nestTables=true) {
    return this.toBuilder()
    .setNestTables(nestTables)
    .build()
  }

  withQuery(query) {
    return this.toBuilder()
    .setQuery(query)
    .build()
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

  toBuilder() {
    return new Builder(this)
  }
}

class Builder {
  constructor(builder) {
    if (builder) {
      this.configuration = builder.configuration
      this.nestTables = builder.nestTables
      this.query = builder.query
    }
  }

  setDataSourceConfiguration(configuration) {
    this.configuration = configuration
    return this
  }

  setNestTables(nestTables=true) {
    this.nestTables = nestTables
    return this
  }

  setQuery(query) {
    this.query = query
    return this
  }

  build() {
    return new Read(Object.entries(this))
  }
}

class MySqlIO {
  static read() {
    return new Builder().setNestTables(false).build()
  }
};

MySqlIO.DataSourceConfiguration = require('./DataSourceConfiguration')

module.exports = MySqlIO;
