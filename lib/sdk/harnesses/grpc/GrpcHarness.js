'use strict';
const grpc = require('grpc');

const DirectHarness = require('../direct/DirectHarness');

class GrpcHarness {
  constructor() {
    const PROTO_PATH = __dirname + '/beamFnApi.proto';
    const fnProto = grpc.load(PROTO_PATH).fn_execution;

    this.harnesses = [];

    /**
     * Starts an RPC server that receives requests for the BeamFnControl service at the
     * sample server port
     */

    this.server = new grpc.Server();

    this.server.addService(
      fnProto.BeamFnControl.service,
      {
        control: this.control.bind(this)
      }
    );
    this.server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
    this.server.start();
  }

  /**
   * Implements the Control RPC method.
   */

  control(call) {
    call.on('end', () => {
      call.end();
    });

    call.on('data', request => {
      let id = 'no id';

      if (request.request === 'register') {
        let pbd = request.register.process_bundle_descriptor;
        id = pbd[0].id;

        let harness = this.harnesses[id] = new DirectHarness();

        harness.register(pbd[0].transforms);

        call.write({
          instruction_id: request.instruction_id
        });
      }

      if (request.request === 'process_bundle') {
        let id = request.process_bundle.process_bundle_descriptor_reference;
        let harness = this.harnesses[id];

        harness.processBundle()
        .then(() => {
            call.write({
              instruction_id: request.instruction_id,
              process_bundle: {
                metrics: {
                  message: 'Hello ' + id
                }
              }
            });
          },
          reason => {
            call.write({
              instruction_id: request.instruction_id,
              error: `It's all gone wrong: ${JSON.stringify(reason)}`,
              process_bundle: {
                metrics: {
                  message: 'Hello ' + id
                }
              }
            });
          }
        );
      }
    });
  }
}

module.exports = GrpcHarness;
