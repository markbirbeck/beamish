'use strict';

const ParDo = require('./ParDo');
const ProcessContext = require('../../transforms/ProcessContext');

const h = require('highland');

class DirectHarness {
  register(graph) {

    /**
     * Create a pipeline from the graph:
     */

    let pipeline = JSON.parse(graph);

    this.processElement = h.pipeline((s) => {
      let stream = s;

      pipeline.map((node) => {

        /**
         * Hydrate the DoFn:
         */

        const doFn = ParDo().of(node.source);

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
            if (!doFn.setupComplete) {
              doFn.setup();
            }
            if (!doFn.started) {
              doFn.startBundle();
            }

            if (x === h.nil) {
              const pe = new ProcessContext(x, y => push(null, y));

              doFn.finishBundle(pe)
              .then(() => {
                push(null, h.nil);
              })
              .catch(err => {

                /**
                 * Propagate the error before terminating the input:
                 */

                push(err);
                push(null, h.nil);
              })
              ;
            }

            /**
             * Otherwise set up a ProcessContext with the data and an 'output'
             * function, and then pass this into the DoFn:
             */

            else {
              const pe = new ProcessContext(x, y => push(null, y));

              doFn.processElement(pe)
              .then(next)
              .catch(err => {

                /**
                 * Propagate the error before moving on to the next input:
                 */

                push(err);
                next();
              })
              ;
            }
          }
        });
      });

      return stream;
    });
    return this;
  }

  processBundle() {

    /**
     * Now run the input data through the constructed pipeline:
     */

    return new Promise((resolve, reject) => {

      /**
       * [TODO] This is a temporary measure until we add 'input':
       */

      h([''])
      .through(this.processElement)
      .errors(reject)
      .done(resolve)
      ;

    });
  }
}

module.exports = DirectHarness;
