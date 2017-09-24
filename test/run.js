const chai = require('chai');

chai.use(require('chai-as-promised'));
chai.should();

const Pipeline = require('../lib/sdk/Pipeline');
const ParDo = require('../lib/sdk/transforms/ParDo');
const DoFn = require('../lib/sdk/transforms/DoFn');
const Create = require('../lib/sdk/transforms/Create');

/**
 * Define successful and failing DoFns:
 */

class SuccessFN extends DoFn {
  processElement() {
    return 'hello, world';
  }
}

class FailFN extends DoFn {
  processElement() {
    throw new Error('blah');
    return 'hello, world';
  }
}

describe('pipeline#run()', () => {
  it('run successful function', () => {

    let p = Pipeline.create();

    return p
    .apply(ParDo().of(Create.of(['abc xyz 123'])))
    .apply(ParDo().of(new SuccessFN()))
    .run()
    .should.be.fulfilled;
    ;
  });

  it('run failing function', () => {

    let p = Pipeline.create();

    return p
    .apply(ParDo().of(Create.of(['abc xyz 123'])))
    .apply(ParDo().of(new FailFN()))
    .run()
    .should.be.rejected;
    ;
  });
});