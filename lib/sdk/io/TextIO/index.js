/**
 * https://beam.apache.org/documentation/sdks/javadoc/2.3.0/org/apache/beam/sdk/io/TextIO.html
 */

const ParDo = require('../../transforms/ParDo');

class TextIO {
  static read() {
    return new TextIO.Read.Builder().build();
  }

  static write() {
    return new TextIO.Write.Builder().build();
  }
};

TextIO.Read = class Read {
  static get Builder() {
    return class Builder {
      build() {
        return new Read();
      }
    };
  }

  from(filepattern) {
    const TextSource = require('./TextSource');

    return ParDo.of(new TextSource(filepattern));
  }
}

TextIO.Write = class Write {
  static get Builder() {
    return class Builder {
      build() {
        return new Write();
      }
    };
  }

  to(filepattern) {
    const TextSink = require('./TextSink');

    return ParDo.of(new TextSink(filepattern));
  }
}

module.exports = TextIO;
