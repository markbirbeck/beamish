const chai = require('chai');

chai.use(require('chai-as-promised'));
chai.should();

const Pipeline = require('../lib/Pipeline');
const ParDo = require('../lib/ParDo');
const DoFn = require('../lib/DoFn');

/**
 * Define a DoFn for ParDo:
 */

class ComputeWordLengthFn extends DoFn {
  processElement(c) {
    let word = c.element();

    c.output(word.length);
  }
}

class SplitLineFn extends DoFn {
  processElement(c) {
    let line = c.element();

    line.split(' ').forEach(word => c.output(word));
  }
}

class OutputFn extends DoFn {
  processElement(c) {
    console.log(c.element());
  }
}

describe('processElement', () => {
  it('simple function', () => {
    let p = Pipeline.create();

    p
    .apply(ParDo().of(new ComputeWordLengthFn()))
    .apply(ParDo().of(new OutputFn()))
    .run()
    ;
  });

  it('multiple output() calls', () => {
    let p = Pipeline.create();

    p
    .apply(ParDo().of(new SplitLineFn()))
    .apply(ParDo().of(new ComputeWordLengthFn()))
    .apply(ParDo().of(new OutputFn()))
    .run()
    ;
  });
});
