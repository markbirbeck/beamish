const { argv } = require('yargs');

/**
 * Set a gRPC harness running:
 */

console.log('OpenFaas SDK Fn Harness started');
console.log(`OpenFaas SDK Fn Harness: Logging location ${argv.logging_endpoint}`);
console.log(`OpenFaas SDK Fn Harness: Control location ${argv.control_endpoint}`);
console.log(`OpenFaas SDK Fn Harness: Pipeline options ${JSON.stringify(argv)}`);

const FnHarness = require('../../fn/harness/FnHarness');

new FnHarness(argv, __dirname + '/OpenFaasHarness');
