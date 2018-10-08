const ParDo = require('../../transforms/ParDo')
const PTransform = require('../../transforms/PTransform');
const Read = require('./../Read');
const SerializableUtils = require('../../util/SerializableUtils');

class MySqlIO {
  static get Read() {
    return class _Read extends PTransform {
      static get Builder() {
        return class Builder {
          constructor() {
            this.nestTables = false
          }

          build() {
            return new _Read();
          }
        };
      }

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
        const MySqlSource = require('./MySqlSource');

        return input.apply(
          ParDo.of(
            new Read.Bounded(
              null,
              SerializableUtils.serialize(
                new MySqlSource(this)
              )
            )
          )
        )
      }
    }
  }

  static read() {
    return new MySqlIO.Read.Builder().build();
  }
};

MySqlIO.DataSourceConfiguration = require('./DataSourceConfiguration')

module.exports = MySqlIO;
