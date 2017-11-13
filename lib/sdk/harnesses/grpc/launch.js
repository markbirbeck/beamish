const { argv } = require('yargs');

/**
 * Set a gRPC harness running:
 */

console.log('SDK Fn Harness started');
console.log(`SDK Fn Harness: Logging location ${argv.logging_endpoint}`);
console.log(`SDK Fn Harness: Control location ${argv.control_endpoint}`);
console.log(`SDK Fn Harness: Pipeline options ${JSON.stringify(argv)}`);

const GrpcHarness = require('./GrpcHarness');

new GrpcHarness(argv);
