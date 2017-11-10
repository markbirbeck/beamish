const Bounded = require('../transforms/Bounded');
const ParDo = require('../transforms/ParDo');

/**
 * [TODO] This should be based on PTransform.
 */

class _Read extends Bounded {
  constructor(source) {
    super();
    this.source = source;
  }

  processStart() {
    let source = new this.source();
    this.reader = source.createReader();
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
    return ParDo.of(new _Read(require('./MySqlSource')));
  }
}

class MySqlIO {
  static read() {
    return new Read.Builder().build();
  }
};

module.exports = MySqlIO;
