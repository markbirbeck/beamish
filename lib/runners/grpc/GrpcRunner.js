'use strict';

const HarnessProxy = require('../../sdk/harnesses/grpc/GrpcHarnessProxy');
const PipelineRunner = require('../../sdk/PipelineRunner');

let count = 0;

class GrpcRunner extends PipelineRunner {
  constructor() {

    /**
     * Create a harness:
     */

    super();
    this.id = count++;
    console.log(`gRPC Runner: Creating new harness (harness #${this.id})`);
    this.harness = new HarnessProxy();
  }

  run(pipeline) {

    /**
     * Create a pipeline of all of the transform steps:
     */

    let graph = JSON.stringify(pipeline.transforms.graph.map(source => ({
      type: 'udf',
      source
    })));

    console.log(`gRPC Runner: Registering graph (harness #${this.id}) "${graph}"`);
    this.registered = this.harness.register(this.id, graph);
    return this;
  }

  waitUntilFinish() {
    console.log(`gRPC Runner: Waiting until registered (harness #${this.id})`);
    return this.registered.then(() => {
      console.log(`gRPC Runner: Processing bundle (harness #${this.id})`);
      return this.harness.processBundle(this.id);
    });
  }
}

module.exports = GrpcRunner;
