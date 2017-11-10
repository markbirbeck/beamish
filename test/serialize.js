const chai = require('chai');

chai.use(require('chai-as-promised'));
chai.should();

const Pipeline = require('../lib/sdk/Pipeline');
const ParDo = require('../lib/sdk/transforms/ParDo');
const DoFn = require('../lib/sdk/transforms/DoFn');

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
    .apply(ParDo.of(new ComputeWordLengthFn()))
    ;

    /**
     * Test the graph:
     */

    const graph = p.transforms.graph;

    graph.should.be.an('array');
    graph.should.have.lengthOf(1);

    graph[0]
    .should.eql(
`new class ComputeWordLengthFn extends DoFn {
  processElement() {
    return 'hello, world';
  }
}().init({})`
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
    .apply(ParDo.of(new ComputeWordLengthFn()))
    .apply(ParDo.of(new ComputeWordLengthFn()))
    .apply(ParDo.of(new ComputeWordLengthFn()))
    ;

    /**
     * Test the graph:
     */

    const graph = p.transforms.graph;

    graph.should.be.an('array');
    graph.should.have.lengthOf(3);

    graph
    .forEach(el => {
      el
      .should.eql(
`new class ComputeWordLengthFn extends DoFn {
  processElement() {
    return 'hello, world';
  }
}().init({})`
      )
    });
  });

  it('compile function with initialised values', () => {
    let p = Pipeline.create();

    /**
     * Define a DoFn for ParDo:
     */

    class GreetingFn extends DoFn {
      constructor(greeting) {
        super();
        this.greeting = greeting;
      }

      processElement() {
        return `${this.greeting}, world`;
      }
    }

    p
    .apply(ParDo.of(new GreetingFn('hello')))
    ;

    /**
     * Test the graph:
     */

    const graph = p.transforms.graph;

    graph.should.be.an('array');
    graph.should.have.lengthOf(1);

    graph[0]
    .should.eql(
`new class GreetingFn extends DoFn {
      constructor(greeting) {
        super();
        this.greeting = greeting;
      }

      processElement() {
        return \`\${this.greeting}, world\`;
      }
    }().init({"greeting":"hello"})`
    );
  });
});
