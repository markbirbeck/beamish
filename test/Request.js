const chai = require('chai');

chai.use(require('chai-as-promised'));
chai.should();

const DoFn = require('../lib/sdk/transforms/DoFn');
const ParDo = require('../lib/sdk/transforms/ParDo');
const Pipeline = require('../lib/sdk/Pipeline');
const PipelineOptionsFactory = require('../lib/sdk/options/PipelineOptionsFactory')
const RequestIO = require('../lib/sdk/io/RequestIO');


describe.only('Request', () => {
  it('postcode', () => {
    const options = PipelineOptionsFactory.create();
    const p = Pipeline.create(options);

    p
    .apply(
      RequestIO.read().withUrl('https://api.postcodes.io/postcodes/sw97de')
    )
    .apply(ParDo.of(new class extends DoFn {
      processElement(c) {
        c.element()
        .should.have.property('result')
        .with.property('longitude', -0.113948279465892);
      }
    }))
    ;

    /**
     * Run the pipeline:
     */

    return p.run().waitUntilFinish();
  });
});
