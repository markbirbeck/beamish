const DoFn = require('../transforms/DoFn');
const PTransform = require('../transforms/PTransform');
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
 * A {@link PTransform} for reading from a {@link Source}.
 *
 * <p>Usage example:
 * <pre>
 * let p = Pipeline.create();
 * p.apply(Read.from(new MySource().withFoo("foo").withBar("bar")));
 * </pre>
 */

class Read {
  static from(source) {

    /**
     * [TODO]: Ideally we'd let the serialization process take care of
     * nested classes:
     */

    return new Read.Bounded(null, serializeObject(source));
  }

  static get Bounded() {

    /**
     * [TODO] Should be based on PTransform not DoFn.
     */

    return class Bounded extends DoFn {
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
    }
  }
}

module.exports = Read;
