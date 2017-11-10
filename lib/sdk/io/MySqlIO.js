const Bounded = require('../transforms/Bounded');
const ParDo = require('../transforms/ParDo');

/**
 * [TODO] This should be based on PTransform.
 */

class _Read extends Bounded {
  constructor() {
    super();
  }

  processStart() {
    const MySqlSource = require('../../io/MySqlSource');
    const MySqlReader = MySqlSource.MySqlReader;
    this.reader = new MySqlReader();
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
}

class Read {
  static get Builder() {
    return class Builder {
      build() {
        return new Read();
      }
    };
  }

  from() {
    return ParDo.of(new _Read());
  }
}

class MySqlIO {
  static read() {
    return new Read.Builder().build();
  }
};

module.exports = MySqlIO;
