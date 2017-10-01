const DoFn = require('../transforms/DoFn');

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
  from(filepattern) {
    return new _Read(filepattern);
  }
}

class Builder {
  build() {
    return new Read();
  }
}

class TextIO {
  static read(elements) {
    return new Builder().build();
  }
};

module.exports = TextIO;
