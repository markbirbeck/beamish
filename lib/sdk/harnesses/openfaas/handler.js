const DirectHarness = require('./DirectHarness');

module.exports = (context, callback) => {

  /**
   * Set a harness running:
   */

  const harness = new DirectHarness();

  /**
   * Pass the graph to the harness:
   */

  harness.register(context);

  /**
   * Execute it:
   */

  harness.processBundle().then(() => {
    callback(null, {status: 'done'});
  });
}
