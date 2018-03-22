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

    c.output(fs.readFileSync(this.filepattern));
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
    return ParDo.of(new _Read(filepattern));
  }
}

class _Write extends DoFn {
  constructor(filepattern) {
    super();
    this.filepattern = filepattern;
  }

  processStart() {
    this.fs = require('fs');
    this.fd = this.fs.openSync(this.filepattern, 'w')
  }

  apply(input) {
    this.fs.writeSync(this.fd, input);
  }

  processFinish() {
    delete this.fs;
  }
}

class Write {
  static Builder() {
    return new class {
      build() {
        return new Write();
      }
    }();
  }

  to(filepattern) {
    return ParDo.of(new _Write(filepattern));
  }
}

class FileIO {
  static read() {
    return Read.Builder().build();
  }

  static write() {
    return Write.Builder().build();
  }
};

module.exports = FileIO;
