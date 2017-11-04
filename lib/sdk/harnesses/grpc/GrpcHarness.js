'use strict';
const grpc = require('grpc');

const DirectHarness = require('../direct/DirectHarness');

class GrpcHarness {
  constructor() {
    const PROTO_PATH = __dirname + '/beamFnApi.proto';
    const fnProto = grpc.load(PROTO_PATH).fn_execution;

    this.harnesses = [];

    this.client = new fnProto.BeamFnControl('0.0.0.0:50051',
      grpc.credentials.createInsecure());

    /**
     * Wait for the client to be ready before kicking off the
     * conversation:
     */

    let deadline = new Date();

    deadline.setSeconds(deadline.getSeconds() + 30);

    grpc.waitForClientReady(this.client, deadline, (err) => {
      if (err) {
        console.error(err);
        process.exit(-1);
      } else {
        this.control(this.client.control());
      }
    });
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
