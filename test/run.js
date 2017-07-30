const chai = require('chai');

chai.use(require('chai-as-promised'));
chai.should();

const Pipeline = require('../lib/Pipeline');
const ParDo = require('../lib/ParDo');
const DoFn = require('../lib/DoFn');

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
    .apply(ParDo().of(new SuccessFN()))
    .run()
    .should.be.fulfilled;
    ;
  });

  it('run failing function', () => {

    let p = Pipeline.create();

    return p
    .apply(ParDo().of(new FailFN()))
    .run()
    .should.be.rejected;
    ;
  });
});
