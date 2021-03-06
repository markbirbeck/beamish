const PTransform = require('../transforms/PTransform');
const ParDo = require('../transforms/ParDo');
const SerializableUtils = require('../util/SerializableUtils');

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

    return new Read.Bounded(null, SerializableUtils.serialize(source));
  }

  static get Bounded() {
    return class Bounded extends PTransform {
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
