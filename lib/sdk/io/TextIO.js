const DoFn = require('../transforms/DoFn');
const ParDo = require('../transforms/ParDo');

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

class Read {
  static Builder() {
    return new class {
      build() {
        return new Read();
      }
    }();
  }

  from(filepattern) {
    return ParDo().of(new _Read(filepattern));
  }
}

class TextIO {
  static read(elements) {
    return Read.Builder().build();
  }
};

module.exports = TextIO;
