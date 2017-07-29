const chai = require('chai');

chai.use(require('chai-as-promised'));
chai.should();

describe('compile pipeline', () => {
  it('compile simple function', () => {
    const Pipeline = require('../lib/Pipeline');

    /**
     * Set up our pipeline:
     */

    let p = Pipeline.create();

    /**
     * Add a simple function:
     */

    p
    .apply(() => { return 'hello, world'; })
    ;

    /**
     * Test the graph:
     */

    p.graph.should.be.an('array');
    p.graph.should.have.lengthOf(1);
    p.graph[0].should.eql('() => { return \'hello, world\'; }');
  });
});
