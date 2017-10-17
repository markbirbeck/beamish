'use strict';

const DirectHarness = require('../../sdk/harnesses/direct/DirectHarness');
const PipelineRunner = require('../../sdk/PipelineRunner');

class DirectRunner extends PipelineRunner {
  run(pipeline) {

    /**
     * Create a pipeline of all of the transform steps:
     */

    this.harness = new DirectHarness(pipeline);
    return this;
  }

  waitUntilFinish() {
    return this.harness.waitUntilFinish();
  }
}

module.exports = DirectRunner;
