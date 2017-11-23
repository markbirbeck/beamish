const grpc = require('grpc');
const PROTO_PATH = __dirname + '/beamFnApi.proto';

module.exports = grpc.load(PROTO_PATH);
