'use strict';
const grpc = require('grpc');

const DirectHarness = require('../../sdk/harnesses/direct/DirectHarness');
const PipelineRunner = require('../../sdk/PipelineRunner');

class DirectRunner extends PipelineRunner {
  constructor() {

    /**
     * Create a harness:
     */

    super();
    this.harness = new DirectHarness();

    var PROTO_PATH = __dirname + '/beamFnApi.proto';

    var fnProto = grpc.load(PROTO_PATH).fn_execution;

    var client = new fnProto.BeamFnControl('0.0.0.0:50051',
                                         grpc.credentials.createInsecure());

    var user;
    if (process.argv.length >= 3) {
      user = process.argv[2];
    } else {
      user = 'world';
    }
    client.control({
      instruction_id: 'abc',
      register: {name: user}
    }, function(err, response) {
      console.log('Greeting:', response.message);
    });
  }

  run(pipeline) {

    /**
     * Create a pipeline of all of the transform steps:
     */

    let graph = JSON.stringify(pipeline.transforms.graph.map(source => ({
      type: 'udf',
      source
    })));

    this.harness.register(graph);
    return this;
  }

  waitUntilFinish() {
    return this.harness.processBundle();
  }
}

module.exports = DirectRunner;
