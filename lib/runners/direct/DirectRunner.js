'use strict';

const DirectHarness = require('../../sdk/harnesses/direct/DirectHarness');
const PipelineRunner = require('../../sdk/PipelineRunner');

class DirectRunner extends PipelineRunner {
  constructor() {

    /**
     * Create a harness:
     */

    super();
    this.harness = new DirectHarness();
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
