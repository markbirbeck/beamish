const DoFn = require('../../transforms/DoFn');

/**
 * [TODO] This should be based on PTransform.
 */

class TextSource extends DoFn {
  constructor(filepattern) {
    super();
    this.filepattern = filepattern;
  }

  processElement(c) {
    const fs = require('fs');

    c.output(fs.readFileSync(this.filepattern, 'utf-8'));
  }
}

module.exports = TextSource;
