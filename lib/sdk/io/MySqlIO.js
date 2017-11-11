const PTransform = require('../transforms/PTransform');
const SdkRead = require('./Read');

class Read extends PTransform {
  static get Builder() {
    return class Builder {
      build() {
        return new Read();
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

    return SdkRead.from(new MySqlSource(this));
  }
}

class MySqlIO {
  static read() {
    return new Read.Builder().build();
  }
};

module.exports = MySqlIO;
