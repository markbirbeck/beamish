const { argv } = require('yargs');

/**
 * Set a gRPC harness running:
 */

const GrpcHarness = require('./GrpcHarnessOpenFaas');

new GrpcHarness(argv);
