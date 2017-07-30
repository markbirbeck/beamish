'use strict';

const PipelineRunner = require('./PipelineRunner');
const ParDo = require('./ParDo');

const h = require('highland');

class DirectRunner extends PipelineRunner {
  run(pipeline) {

    /**
     * Create a pipeline of all of the transform steps:
     */

    let processElement = h.pipeline((s) => {
      let stream = s;

      pipeline.transforms.graph.map((source) => {
        stream = stream.map(ParDo().of(source));
      });

      return stream;
    });

    /**
     * Now run the input data through the constructed pipeline:
     */

    return new Promise((resolve, reject) => {

      /**
       * [TODO] This is a temporary measure until we add 'input':
       */

      h(['abc', 'xyz', '123'])
      .through(processElement)
      .errors((err) => {
        reject(err);
      })
      .done(() => {
        resolve();
      })
      ;

    });
  }
}

module.exports = DirectRunner;
