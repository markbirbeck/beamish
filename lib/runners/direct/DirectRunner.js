'use strict';

const PipelineRunner = require('../../sdk/PipelineRunner');
const ParDo = require('./ParDo');
const ProcessContext = require('../../sdk/transforms/ProcessContext');

const h = require('highland');

class DirectRunner extends PipelineRunner {
  run(pipeline) {

    /**
     * Create a pipeline of all of the transform steps:
     */

    let processElement = h.pipeline((s) => {
      let stream = s;

      pipeline.transforms.graph.map((source) => {

        /**
         * Hydrate the DoFn:
         */

        const doFn = ParDo().of(source);

        stream = stream.consume((err, x, push, next) => {

          /**
           * Errors get passed on:
           */

          if (err) {
            push(err);
            next();
          }

          /**
           * If this is the end of the stream then pass that on, too:
           */

          else {
            if (!doFn.started) {
              doFn.startBundle();
            }

            if (x === h.nil) {
              const pe = new ProcessContext(x, y => push(null, y));

              doFn.finishBundle(pe);
            }

            /**
             * Otherwise set up a ProcessContext with the data and an 'output'
             * function, and then pass this into the DoFn:
             */

            else {
              const pe = new ProcessContext(x, y => push(null, y));

              doFn.processElement(pe);
              next();
            }
          }
        });
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

      h([''])
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
