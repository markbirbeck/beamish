const chai = require('chai');

chai.use(require('chai-as-promised'));
chai.should();

const mockServer = require('mockserver-client');
const mockServerClient = mockServer.mockServerClient;

const DoFn = require('../lib/sdk/transforms/DoFn');
const ParDo = require('../lib/sdk/transforms/ParDo');
const Pipeline = require('../lib/sdk/Pipeline');
const PipelineOptionsFactory = require('../lib/sdk/options/PipelineOptionsFactory')
const RequestIO = require('../lib/sdk/io/RequestIO');


describe('Request', () => {
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
        .with.property('longitude', -0.113948);
      }
    }))
    ;

    /**
     * Run the pipeline:
     */

    return p.run().waitUntilFinish();
  });

  it('follow redirects', async () => {
    const ms = mockServerClient('mockserver', 1080);

    /**
     * Clear any previous mocks:
     */

    await ms.reset();

    /**
     * Set up a mock that serves up a redirect:
     */

    await ms.mockAnyResponse({
      httpRequest: {
        path: '/path1'
      },
      httpResponse: {
        statusCode: 302,
        headers: [{
          name: 'Location',
          values: ['/path2']
        }]
      }
    });

    /**
     * Set up another mock that responds to the redirect:
     */

    await ms.mockAnyResponse({
      httpRequest: {
        path: '/path2'
      },
      httpResponse: {
        body: '{"claim": "we made it!"}'
      }
    });

    /**
     * Now run the pipeline and check that we do actually get redirected:
     */

    const options = PipelineOptionsFactory.create();
    const p = Pipeline.create(options);

    return p
    .apply(RequestIO.read().withUrl('http://mockserver:1080/path1'))
    .apply(ParDo.of(new class extends DoFn {
      processElement(c) {
        c.element()
        .should.have.property('claim', 'we made it!');
      }
    }))
    .run().waitUntilFinish();
  });

  it('retrieve text files', async () => {
    const ms = mockServerClient('mockserver', 1080);

    /**
     * Clear any previous mocks:
     */

    await ms.reset();

    /**
     * Set up a mock that serves up a text file:
     */

    await ms.mockAnyResponse({
      httpRequest: {
        path: '/text/plain'
      },
      httpResponse: {
        body: 'I like text',
        headers: [{
          name: 'Content-Type',
          values: ['text/plain']
        }]
      }
    });

    /**
     * Now run the pipeline and check that we get text:
     */

    const options = PipelineOptionsFactory.create();
    const p = Pipeline.create(options);

    return p
    .apply(RequestIO.read().withUrl('http://mockserver:1080/text/plain'))
    .apply(ParDo.of(new class extends DoFn {
      processElement(c) {
        c.element()
        .should.have.equal('I like text');
      }
    }))
    .run().waitUntilFinish();
  });
});
