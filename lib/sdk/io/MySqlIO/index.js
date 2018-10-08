const ParDo = require('../../transforms/ParDo')
const PTransform = require('../../transforms/PTransform');
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
            new class extends PTransform {
              constructor(name, source) {
                super(name);
                this.source = source;
              }

              processStart() {
                this.reader = this.source.createReader();
              }

              async processElement(c) {
                let available = await this.reader.start();

                while (available) {
                  c.output(this.reader.getCurrent());
                  available = await this.reader.advance();
                }
              }

              processFinish() {
                this.reader.close();
              }
            }(
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
