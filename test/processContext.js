const chai = require('chai');

chai.use(require('chai-as-promised'));
chai.should();

const Pipeline = require('../lib/sdk/Pipeline');
const ParDo = require('../lib/sdk/transforms/ParDo');
const DoFn = require('../lib/sdk/transforms/DoFn');
const Create = require('../lib/sdk/transforms/Create');

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

    return p
    .apply(ParDo().of(Create.of(['abc xyz 123'])))
    .apply(ParDo().of(new ComputeWordLengthFn()))
    .apply(ParDo().of(new OutputFn()))
    .run()
    .waitUntilFinish()
    ;
  });

  it('multiple output() calls', () => {
    let p = Pipeline.create();

    return p
    .apply(ParDo().of(Create.of(['abc xyz 123'])))
    .apply(ParDo().of(new SplitLineFn()))
    .apply(ParDo().of(new ComputeWordLengthFn()))
    .apply(ParDo().of(new OutputFn()))
    .run()
    .waitUntilFinish()
    ;
  });
});
