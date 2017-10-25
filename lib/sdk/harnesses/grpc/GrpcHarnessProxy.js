'use strict';
const grpc = require('grpc');

let instructionId = 0;

class GrpcHarnessProxy {
  constructor() {
    const PROTO_PATH = __dirname + '/beamFnApi.proto';
    const fnProto = grpc.load(PROTO_PATH).fn_execution;

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

    this.promise = [];
  }

  /**
   * Implements the Control RPC method.
   */

  control(call) {
    this.call = call;

    call.on('end', () => {
      call.end();
    });

    call.on('data', message => {
      let iid = message.instruction_id;

      if (message.error !== '') {
        this.promise[iid].reject(message.error);
      } else {
        this.promise[iid].resolve();
      }
    });
  }

  register(id, graph) {
    let localIID = String(instructionId++);

    this.call.write({
      instruction_id: localIID,
      register: {
        process_bundle_descriptor: [{
          id: String(id),
          transforms: graph
        }]
      }
    });

    return new Promise((resolve, reject) => {
      this.promise[localIID] = {resolve, reject};
    });
  }

  processBundle(id) {
    let localIID = String(instructionId++);

    this.call.write({
      instruction_id: localIID,
      process_bundle: {
        process_bundle_descriptor_reference: String(id)
      }
    });

    return new Promise((resolve, reject) => {
      this.promise[localIID] = {resolve, reject};
    });
  }
}

module.exports = GrpcHarnessProxy;
