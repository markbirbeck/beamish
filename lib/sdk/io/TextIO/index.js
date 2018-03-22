/**
 * https://beam.apache.org/documentation/sdks/javadoc/2.3.0/org/apache/beam/sdk/io/TextIO.html
 */

const DoFn = require('../../transforms/DoFn');
const ParDo = require('../../transforms/ParDo');

/**
 * [TODO] This should be based on PTransform.
 */

class _Read extends DoFn {
  constructor(filepattern) {
    super();
    this.filepattern = filepattern;
  }

  processElement(c) {
    const fs = require('fs');

    c.output(fs.readFileSync(this.filepattern, 'utf-8'));
  }
}

class _Write extends DoFn {
  constructor(filepattern) {
    super();
    this.filepattern = filepattern;
    this.encoding = 'utf-8';
  }

  processStart() {
    this.fs = require('fs');
    this.fd = this.fs.openSync(this.filepattern, 'w')
  }

  apply(input) {
    this.fs.writeSync(this.fd, input, this.encoding);
    this.fs.writeSync(this.fd, '\n', this.encoding);
  }

  processFinish() {
    delete this.fs;
  }
}

class TextIO {
  static read(elements) {
    return new TextIO.Read.Builder().build();
  }

  static write(elements) {
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
    return ParDo.of(new _Read(filepattern));
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
    return ParDo.of(new _Write(filepattern));
  }
}

module.exports = TextIO;
