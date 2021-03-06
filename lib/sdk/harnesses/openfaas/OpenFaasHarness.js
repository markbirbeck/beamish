'use strict';

const request = require('request-promise-native');

class OpenFaasHarness {
  register(graph) {

    /**
     * Nothing to do in register, other than track the graph:
     */

    this.graph = graph;
    return this;
  }

  processBundle() {

    /**
     * Push the graph to the OpenFaaS function:
     */

    console.log('About to send graph:', this.graph);

    return request({
      method: 'POST',
      uri: 'http://0.0.0.0:8080/function/func_beamish-harness',
      body: this.graph
    });
  }
}

module.exports = OpenFaasHarness;
