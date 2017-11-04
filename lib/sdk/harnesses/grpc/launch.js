const { argv } = require('yargs');

/**
 * Set a gRPC harness running:
 */

const GrpcHarness = require('./GrpcHarness');

new GrpcHarness(argv);
