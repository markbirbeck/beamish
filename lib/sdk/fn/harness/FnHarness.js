'use strict';
const grpc = require('grpc');

class FnHarness {
  constructor(args, harness) {
    const PROTO_PATH = __dirname + '/beamFnApi.proto';
    const fnProto = grpc.load(PROTO_PATH).fn_execution;

    this.Harness = require(harness || '../../harnesses/direct/DirectHarness');

    this.harnesses = [];

    console.log(`SDK Fn Harness: Creating client for control endpoint at ${args.control_endpoint}`);

    this.client = new fnProto.BeamFnControl(args.control_endpoint,
      grpc.credentials.createInsecure());

    /**
     * Wait for the client to be ready before kicking off the
     * conversation:
     */

    let deadline = new Date();

    deadline.setSeconds(deadline.getSeconds() + 30);

    console.log(`SDK Fn Harness: Waiting until ${deadline} for client to be ready`);
    grpc.waitForClientReady(this.client, deadline, (err) => {
      if (err) {
        console.error(err);
        process.exit(-1);
      } else {
        console.log(`SDK Fn Harness: Connected successfully to ${args.control_endpoint}`);

        this.control(this.client.control());
      }
    });
  }

  /**
   * Implements the Control RPC method.
   */

  control(call) {
    call.on('end', () => {
      console.log('SDK Fn Harness: Received \'end\' event');

      call.end();
    });

    call.on('data', request => {
      let id = 'no id';

      console.log(`SDK Fn Harness: Received 'data' event ${JSON.stringify(request)}`);

      if (request.request === 'register') {
        let pbd = request.register.process_bundle_descriptor;
        id = pbd[0].id;

        console.log(`SDK Fn Harness: Creating harness #${id}`);

        let harness = this.harnesses[id] = new this.Harness();

        console.log(`SDK Fn Harness: Registering graph in harness #${id}`);

        harness.register(pbd[0].transforms);

        call.write({
          instruction_id: request.instruction_id
        });
      }

      if (request.request === 'process_bundle') {
        let id = request.process_bundle.process_bundle_descriptor_reference;

        console.log(`SDK Fn Harness: Retrieving harness #${id}`);

        let harness = this.harnesses[id];

        console.log(`SDK Fn Harness: Processing bundle #${id}`);

        harness.processBundle()
        .then(() => {
            console.log(`SDK Fn Harness: Bundle has been processed (bundle #${id}, instruction #${request.instruction_id})`);

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
            console.log(`SDK Fn Harness: Bundle processing failed (bundle #${id}, instruction #${request.instruction_id}) [${reason}]`);

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

module.exports = FnHarness;
