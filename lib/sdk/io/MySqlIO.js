const PTransform = require('../transforms/PTransform');
const Read = require('./Read');

class MySqlIO {
  static get Read() {
    return class _Read extends PTransform {
      static get Builder() {
        return class Builder {
          build() {
            return new _Read();
          }
        };
      }

      withConnectionConfiguration(connectionConfiguration) {
        this.connectionConfiguration = connectionConfiguration;
        return this;
      }

      withQuery(query) {
        this.query = query;
        return this;
      }

      /**
       * [TODO]: This should take a 'PBegin input' parameter,
       * and then call input.apply().
       */

      expand() {
        const MySqlSource = require('./MySqlSource');

        return Read.from(new MySqlSource(this));
      }
    }
  }

  static read() {
    return new MySqlIO.Read.Builder().build();
  }
};

module.exports = MySqlIO;
