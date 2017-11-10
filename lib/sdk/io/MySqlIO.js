const Bounded = require('../transforms/Bounded');
const ParDo = require('../transforms/ParDo');

/**
 * [TODO]: Factor this to some kind of utils area, since it's the same as
 * the code in TransformHierarchy:
 */

const serialize = require('serialize-javascript');
const Serializable = require('./Serializable');

function serializeObject(obj) {

  /**
   * Ensure that the object is serializable:
   */

  if (!obj instanceof Serializable) {
    throw new Error(
      `Class '${obj.constructor.name}' must inherit from Serializable`);
  }

  return `new ${serialize(obj.constructor)}().init(${serialize(obj)});`;
}

/**
 * [TODO] This should be based on PTransform.
 */

class _Read extends Bounded {
  constructor(source) {
    super();
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
    const MySqlSource = require('./MySqlSource');

    /**
     * [TODO]: Ideally we'd let the serialization process take care of
     * nested classes:
     */

    return ParDo.of(new _Read(serializeObject(new MySqlSource(this))));
  }
}

class MySqlIO {
  static read() {
    return new Read.Builder().build();
  }
};

module.exports = MySqlIO;
