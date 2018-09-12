/**
 * Test that steps in a pipeline will expand correctly.
 */

const tap = require('tap')

const Count = require('../../lib/sdk/transforms/Count')
const DoFn = require('../../lib/sdk/transforms/DoFn')
const ParDo = require('../../lib/sdk/transforms/ParDo')
const Pipeline = require('../../lib/sdk/Pipeline')
const Create = require('../../lib/sdk/transforms/Create')

class SplitLineFn extends DoFn {
  processElement(c) {
    let line = c.element()

    line.split(' ').forEach(word => word && c.output(word))
  }
}

const p = Pipeline.create()

p
.apply('Create quote', Create.of([
  'To be, or not to be: that is the question: ',
  'Whether \'tis nobler in the mind to suffer ',
  'The slings and arrows of outrageous fortune, ',
  'Or to take arms against a sea of troubles, '
]))
.apply('Split each line into words', ParDo.of(new SplitLineFn()))
.apply('Count number of words', Count.globally())
.apply('Check the results', ParDo.of(
  new class extends DoFn {
    apply(input) {

      /**
       * TODO(MB): Would be quite simple to set up some kind of 'test' class
       * that already has tap on it. Maybe the class would expose all of the
       * same methods that tap has, so that we could do things like:
       *
       *  .apply(ParDo.of(
       *    new class extends TestDoFn {
       *      equal() {
       *        return 77
       *      }
       *    }
       *  ))
       */

      return require('tap').equal(input, 34)
    }
  }()
))

/**
 * Run the pipeline:
 */

tap.resolves(p.run().waitUntilFinish())
