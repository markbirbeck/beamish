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
  processElement() {
    return 'hello, world';
  }
}

describe('compile pipeline', () => {
  it('compile simple function', () => {

    /**
     * Set up our pipeline:
     */

    let p = Pipeline.create();

    /**
     * Add a simple function:
     */

    p
    .apply(ParDo().of(new ComputeWordLengthFn()))
    ;

    /**
     * Test the graph:
     */

    p.graph.should.be.an('array');
    p.graph.should.have.lengthOf(1);

    p.graph[0]
    .should.eql(
`class ComputeWordLengthFn extends DoFn {
  processElement() {
    return 'hello, world';
  }
}`
    );
  });

  it('compile multiple functions', () => {

    /**
     * Set up our pipeline:
     */

    let p = Pipeline.create();

    /**
     * Add a few copies of the simple function:
     */

    p
    .apply(ParDo().of(new ComputeWordLengthFn()))
    .apply(ParDo().of(new ComputeWordLengthFn()))
    .apply(ParDo().of(new ComputeWordLengthFn()))
    ;

    /**
     * Test the graph:
     */

    p.graph.should.be.an('array');
    p.graph.should.have.lengthOf(3);

    p.graph
    .forEach(el => {
      el
      .should.eql(
`class ComputeWordLengthFn extends DoFn {
  processElement() {
    return 'hello, world';
  }
}`
      )
    });
  });
});
