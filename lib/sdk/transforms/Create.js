const DoFn = require('./DoFn');

class Create {
  static of(items) {
    return new class A extends DoFn {
      constructor(items) {
        super();
        this.items = items;
      }

      processElement(c) {
        this.items.forEach(items => c.output(items));
      }
    }(items);
  }
};

module.exports = Create;
