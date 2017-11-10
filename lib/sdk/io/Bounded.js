const PTransform = require('../transforms/PTransform');
const DoFn = require('../harnesses/direct/DoFn');

class Bounded extends DoFn {
  constructor(source) {
    super();
    this.source = source;
  }

  processStart() {
    console.log('In processStart', this.source);
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
    console.log('In processFinish');
    this.reader.close();
  }

  getSource() {
    return this.source;
  }
}

module.exports = Bounded;
