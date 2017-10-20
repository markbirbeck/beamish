'use strict';
const grpc = require('grpc');

let instructionId = 0;

class GrpcHarnessProxy {
  constructor() {
    const PROTO_PATH = __dirname + '/beamFnApi.proto';
    const fnProto = grpc.load(PROTO_PATH).fn_execution;

    this.client = new fnProto.BeamFnControl('0.0.0.0:50051',
      grpc.credentials.createInsecure());
    this.call = this.client.control();

    this.promise = [];

    this.call.on('data', message => {
      if (message.response === 'process_bundle') {
        let iid = message.instruction_id;

        if (message.error !== '') {
          this.promise[iid].reject(message.error);
        } else {
          this.promise[iid].resolve();
        }
      }
    });

    this.call.on('end', function() {
      this.call.end();
    });
  }

  register(id, graph) {
    this.call.write({
      instruction_id: String(instructionId++),
      register: {
        process_bundle_descriptor: [{
          id: String(id),
          transforms: graph
        }]
      }
    });
    return this;
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
