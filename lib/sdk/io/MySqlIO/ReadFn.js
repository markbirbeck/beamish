const PTransform = require('../../transforms/PTransform')

class ReadFn extends PTransform {
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

module.exports = ReadFn
