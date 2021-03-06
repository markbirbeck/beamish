'use strict';
const grpc = require('grpc');
const fs = require('fs');

/**
 * First check that we can reach Docker:
 */

const socket = process.env.DOCKER_SOCKET || '/var/run/docker.sock';
const stats  = fs.statSync(socket);

console.log('gRPC Harness: Checking Docker status');
if (!stats.isSocket()) {
  throw new Error('Are you sure the docker is running?');
}
console.log('gRPC Harness: Docker is available');

/**
 * Set up a connection to Docker via the API, and then launch the
 * harness container:
 */

const docker = new require('dockerode')({
  socketPath: socket
});

/**
 * Follows the SDK harness container contract described at:
 *
 * https://s.apache.org/beam-fn-api-container-contract
 */

const ARTIFACT_ENDPOINT = '';
const CONTROL_ENDPOINT = '0.0.0.0:50051';
const ID = '';
const LOGGING_ENDPOINT = '';
const PROVISION_ENDPOINT = '';
const SEMI_PERSIST_DIR = '';

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

const fnProto = require('../../model').fn_execution;

let server = new grpc.Server();

server.addService(
  fnProto.BeamFnControl.service,
  {
    control
  }
);

server.bind(CONTROL_ENDPOINT, grpc.ServerCredentials.createInsecure());
server.start();

/**
 * Implements the Control RPC method.
 */

function control(call) {
  call.on('end', () => {
    console.log('gRPC Harness: Received \'end\' event');

    call.end();
  });

  call.on('data', message => {
    let iid = message.instruction_id;

    console.log(`gRPC Harness: Received 'data' event for instruction #${iid}`);

    if (message.error !== '') {
      console.log(`gRPC Harness: Rejecting instruction #${iid} with message '${message.error}'`);

      promise[iid].reject(message.error);
    } else {
      console.log(`gRPC Harness: Resolving instruction #${iid}`);

      promise[iid].resolve();
    }
  });

  /**
   * Let anyone waiting know that we've initialised, and provide the object
   * that is used to communicate:
   */

  console.log('gRPC Harness: Indicating initialisation is complete');
  initialised.resolve(call);
}

class GrpcFnServer {
  constructor(options) {

    /**
     * Launch the requested Docker image:
     */

    this.launch(options.image || 'beamish-fnharness:latest');
  }

  finish() {

    /**
     * Stop the Docker container:
     */

    if (this.container) {
      this.container.stop();
      this.container = null;
    }
  }

  launch(image) {
    console.log(`gRPC Harness: Launching Docker container for ${image}`);
    console.log(`gRPC Harness: Current directory is: ${process.cwd()}`);
    return docker.run(
      image,
      [
        `--id=${ID}`,
        `--logging_endpoint=${LOGGING_ENDPOINT}`,
        `--artifact_endpoint=${ARTIFACT_ENDPOINT}`,
        `--provision_endpoint=${PROVISION_ENDPOINT}`,
        `--control_endpoint=${CONTROL_ENDPOINT}`,
        `--semi_persist_dir=${SEMI_PERSIST_DIR}`,
      ],
      process.stdout,
      { 'HostConfig': { 'NetworkMode': 'host' } },
      (err, data, container) => {
        console.log(`gRPC Harness: Docker callback for ${image}:`);
        console.log(`gRPC Harness:   err: ${err}`);
        console.log(`gRPC Harness:   data: ${JSON.stringify(data)}`);
        console.log(`gRPC Harness:   container: ${JSON.stringify(container)}`);
      }
    )
    .on('container', (container) => {
      console.log(`gRPC Harness: Docker container for ${image} launched`);
      this.container = container;
    })
    ;
  }

  register(id, graph) {
    let localIID = String(instructionId++);

    console.log(`gRPC Harness: Waiting for initialisation to complete before registering graph (harness #${id})`);

    initialised.then(call => {
      console.log(`gRPC Harness: Initialisation complete (harness #${id}), so about to register graph (instruction #${localIID})`);

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

    console.log(`gRPC Harness: Waiting for initialisation to complete before processing bundle (harness #${id})`);

    initialised.then(call => {
      console.log(`gRPC Harness: Initialisation complete (harness #${id}), so about to process bundle (instruction #${localIID})`);

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

module.exports = GrpcFnServer;
