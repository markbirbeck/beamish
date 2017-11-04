'use strict';
const grpc = require('grpc');
const fs = require('fs');

/**
 * First check that we can reach Docker:
 */

const socket = process.env.DOCKER_SOCKET || '/var/run/docker.sock';
const stats  = fs.statSync(socket);

if (!stats.isSocket()) {
  throw new Error('Are you sure the docker is running?');
}

/**
 * Set up a connection to Docker via the API, and then launch the
 * harness container:
 */

const docker = new require('dockerode')({
  socketPath: socket
});

docker.run(
  'beamish-grpc-harness:latest',
  [],
  process.stdout,
  { 'HostConfig': { 'NetworkMode': 'host' } }
);

let instructionId = 0;

/**
 * Create a promise proxy that will wait for server initialisation:
 */

let res;
let rej;
let initialised = new Promise((resolve, reject) => {
  res = resolve;
  rej = reject;
});
initialised.resolve = res;
initialised.reject = rej;

/**
 * Keep an array of promises that will be fired when instructions are
 * complete:
 */

let promise = [];

/**
 * Starts an RPC server that receives requests for the BeamFnControl service at the
 * sample server port
 */

const PROTO_PATH = __dirname + '/beamFnApi.proto';
const fnProto = grpc.load(PROTO_PATH).fn_execution;

let server = new grpc.Server();

server.addService(
  fnProto.BeamFnControl.service,
  {
    control
  }
);

server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
server.start();

/**
 * Implements the Control RPC method.
 */

function control(call) {
  call.on('end', () => {
    call.end();
  });

  call.on('data', message => {
    let iid = message.instruction_id;

    if (message.error !== '') {
      promise[iid].reject(message.error);
    } else {
      promise[iid].resolve();
    }
  });

  /**
   * Let anyone waiting know that we've initialised, and provide the object
   * that is used to communicate:
   */

  initialised.resolve(call);
}

class GrpcHarnessProxy {
  register(id, graph) {
    let localIID = String(instructionId++);

    initialised.then(call => {
      call.write({
        instruction_id: localIID,
        register: {
          process_bundle_descriptor: [{
            id: String(id),
            transforms: graph
          }]
        }
      });
    });

    return new Promise((resolve, reject) => {
      promise[localIID] = {resolve, reject};
    });
  }

  processBundle(id) {
    let localIID = String(instructionId++);

    initialised.then(call => {
      call.write({
        instruction_id: localIID,
        process_bundle: {
          process_bundle_descriptor_reference: String(id)
        }
      });
    });

    return new Promise((resolve, reject) => {
      promise[localIID] = {resolve, reject};
    });
  }
}

module.exports = GrpcHarnessProxy;
