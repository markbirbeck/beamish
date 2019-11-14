/**
 * Pipeline.
 * Factoring DirectRunnerPipeline and NodeStreamsPipeline into here.
 * @module
 */
class Pipeline {
  constructor(options) {
    this.options = options;
  }

  run() {
    const runnerClass = require(`../runners/${this.options.runner}`);
    const runner = new runnerClass();

    return runner.run(this);
  }
}

exports.Pipeline = Pipeline
