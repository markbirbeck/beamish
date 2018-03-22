const DoFn = require('../../transforms/DoFn');

/**
 * [TODO] This should be based on PTransform.
 */

class TextSink extends DoFn {
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

module.exports = TextSink;
