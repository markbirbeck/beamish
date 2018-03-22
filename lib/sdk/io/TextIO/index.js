/**
 * https://beam.apache.org/documentation/sdks/javadoc/2.3.0/org/apache/beam/sdk/io/TextIO.html
 */

const ParDo = require('../../transforms/ParDo');
const PTransform = require('../../transforms/PTransform');
const Read = require('../Read');
const TextSource = require('./TextSource');

class TextIO {
  static read() {
    return new TextIO.Read.Builder().build();
  }

  static write() {
    return new TextIO.Write.Builder().build();
  }
}

TextIO.Read = class _Read extends PTransform {
  static get Builder() {
    return class Builder {
      build() {
        return new _Read();
      }
    };
  }

  /**
   * TODO(MB): This should take a 'PBegin input' parameter, and then
   * call input.apply(). I.e.,
   *
   *  expand(input) {
   *    return input.apply(Read.from(this.getSource()));
   *  }
   */

  expand() {
    return Read.from(this.getSource());
  }

  from(filepattern) {
    this.filepattern = filepattern;
    return this;
  }

  getSource() {
    return new TextSource(this);
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