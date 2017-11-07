'use strict';

const HarnessProxy = require('../../sdk/harnesses/openfaas/GrpcHarnessOpenFaasProxy');
const PipelineRunner = require('../../sdk/PipelineRunner');

let count = 0;

class GrpcOpenFaasRunner extends PipelineRunner {
  constructor() {

    /**
     * Create a harness:
     */

    super();
    this.id = count++;
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

    this.registered = this.harness.register(this.id, graph);
    return this;
  }

  waitUntilFinish() {
    return this.registered.then(() => this.harness.processBundle(this.id));
  }
}

module.exports = GrpcOpenFaasRunner;
