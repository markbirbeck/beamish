/**
 * This should be factored away into Pipeline.js.
 * @module
 */
const { Pipeline } = require('./Pipeline');

class DirectRunnerPipeline extends Pipeline {
  constructor(options = {}) {
    super({
      runner: 'direct/DirectRunner',
      ...options
    });
  }
}

exports.create = options => new DirectRunnerPipeline(options);
