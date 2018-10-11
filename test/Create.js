const tap = require('tap')
tap.comment('Create#of')

const Pipeline = require('../lib/sdk/Pipeline');
const ParDo = require('../lib/sdk/transforms/ParDo');
const DoFn = require('../lib/sdk/transforms/DoFn');
const Create = require('../lib/sdk/transforms/Create');

/**
 * Define a DoFn for ParDo:
 */

class SplitLineFn extends DoFn {
  processElement(c) {
    let line = c.element();

    line.split(' ').forEach(word => c.output(word));
  }
}

class ComputeWordLengthFn extends DoFn {
  apply(element) {
    return element.length;
  }
}

class OutputFn extends DoFn {
  processElement(c) {
    console.log(c.element());
  }
}

const main = async () => {
  const p = Pipeline.create()

  p
  .apply(Create.of([
    'To be, or not to be: that is the question: ',
    'Whether \'tis nobler in the mind to suffer ',
    'The slings and arrows of outrageous fortune, ',
    'Or to take arms against a sea of troubles, '
  ]))
  .apply(ParDo.of(new SplitLineFn()))
  .apply(ParDo.of(new ComputeWordLengthFn()))
  .apply(ParDo.of(new OutputFn()))

  return p
  .run()
  .waitUntilFinish()
}

tap.resolves(main())
