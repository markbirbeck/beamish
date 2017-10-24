'use strict';
const grpc = require('grpc');

let instructionId = 0;

class GrpcHarnessProxy {
  constructor() {
    const PROTO_PATH = __dirname + '/beamFnApi.proto';
    const fnProto = grpc.load(PROTO_PATH).fn_execution;

    this.client = new fnProto.BeamFnControl('harness:50051',
      grpc.credentials.createInsecure());
    this.control(this.client.control());

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
