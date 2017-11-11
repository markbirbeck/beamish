const Bounded = require('../transforms/Bounded');
const ParDo = require('../transforms/ParDo');
const PTransform = require('../transforms/PTransform');

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

    /**
     * [TODO]: This should really look like this:
     *
     *  return Read.from(new MySqlSource(this));
     *
     * [TODO]: Ideally we'd let the serialization process take care of
     * nested classes:
     */

    // return Read.from(new MySqlSource(this));
    return new _Read(serializeObject(new MySqlSource(this)));
  }
}

class MySqlIO {
  static read() {
    return new Read.Builder().build();
  }
};

module.exports = MySqlIO;
