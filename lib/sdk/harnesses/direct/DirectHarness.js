'use strict';

const debug = require('debug')('directharness')
const ParDo = require('./ParDo');
const ProcessContext = require('../../transforms/ProcessContext');

const h = require('highland');

let nextId = 0

function finishBundle(doFn, pe, push, debug) {
  debug('About to finish bundle')
  doFn.finishBundle(pe)
  .then(() => {
    doFn.started = false
    if (doFn.setupComplete) {
      debug('About to perform teardown')
      doFn.teardown()
    }
    push(null, h.nil)
  })
  .catch(err => {
    debug(`Received error after finishing bundle: ${err}`)
    doFn.started = false
    if (doFn.setupComplete) {
      debug('About to perform teardown')
      doFn.teardown()
    }

    /**
     * Propagate the error before terminating the input:
     */

    push(err)
    push(null, h.nil)
  })
}

function createFn(node) {
  const id = nextId++

  /**
   * Override debug() with a local copy that is more specific--it
   * includes an identifier for the pipeline step:
   */

  const debug = require('debug')(`directharness:${id}`)

  /**
   * Hydrate the DoFn:
   */

  debug(`About to hydrate: ${node.source}`)
  const doFn = ParDo().of(node.source);
  doFn.id = id

  return createConsume(doFn, debug)
}

function createInputFn(node) {
  const id = nextId++

  /**
   * Override debug() with a local copy that is more specific--it
   * includes an identifier for the pipeline step:
   */

  const debug = require('debug')(`directharness:${id}`)

  /**
   * Hydrate the DoFn:
   */

  debug(`About to hydrate: ${node.source}`)
  const doFn = ParDo().of(node.source)
  doFn.id = id

  return createInput(doFn, debug)
}

function createConsume(doFn, debug) {
  return (err, x, push, next) => {

    /**
     * Errors get passed on:
     */

    if (err) {
      push(err)
      next()
    } else {
      if (!doFn.setupComplete) {
        debug('About to perform setup')
        doFn.setup()
      }

      if (!doFn.started) {
        debug('About to start bundle')
        doFn.startBundle()
      }

    /**
     * If this is the end of the stream then pass that on, too:
     */

      if (x === h.nil) {
        const pe = new ProcessContext(x, y => push(null, y))

        finishBundle(doFn, pe, push, debug)
      }

      /**
       * Otherwise set up a ProcessContext with the data and an 'output'
       * function, and then pass this into the DoFn:
       */

      else {
        const pe = new ProcessContext(x, y => push(null, y))

        debug(`About to process element: ${JSON.stringify(x)}`)
        doFn.processElement(pe)
        .then(next)
        .catch(err => {
          debug(`Received error while processing element: ${err}`)

          /**
           * Propagate the error before moving on to the next input:
           */

          push(err)
          next()
        })
      }
    }
  }
}

function createInput(doFn, debug) {
  return async (push, next) => {
    if (!doFn.setupComplete) {
      debug('About to perform setup')
      doFn.setup()
    }

    if (!doFn.started) {
      debug('About to start bundle')
      doFn.startBundle()
    }

    /**
     * Otherwise set up a ProcessContext with the data and an 'output'
     * function, and then pass this into the DoFn:
     */

    const pe = new ProcessContext(null, y => {
      debug(`Request to push: ${JSON.stringify(y)}`)
      push(null, y)
    })

    try {
      await doFn.processElement(pe)
    } catch(err) {
      /**
       * TODO(MB): Could do with some kind of 'break on first error'
       * flag:
       */

      debug(`Received error while creating element: ${err}`)

      /**
       * Propagate the error:
       */

      push(err)
    }
    finishBundle(doFn, pe, push, debug)
  }
}

class DirectHarness {
  register(graph) {

    /**
     * Create a pipeline from the graph:
     */

    debug(`About to process graph: ${graph}`)
    let pipeline = JSON.parse(graph);

    this.input = createInputFn(pipeline.shift())

    this.processElement = h.pipeline((s) => {
      let stream = s;

      pipeline.map((node) => {
        stream = stream.consume(createFn(node))
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

      h(this.input)
      .through(this.processElement)
      .errors(err => {
        debug(`Received error while processing bundle: ${err}`)
        reject(err)
      })
      .done(resolve)
      ;

    });
  }
}

module.exports = DirectHarness;
