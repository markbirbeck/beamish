const path = require('path')
const tap = require('tap')
tap.comment('Count#globally')

/**
 * Set up a pipeline that:
 *
 *  - reads lines from a file;
 *  - splits each line into its words;
 *  - counts the total number of words;
 *  - checks the count.
 */

const Count = require('../../../lib/sdk/transforms/Count');
const DoFn = require('../../../lib/sdk/transforms/DoFn');
const MapElements = require('../../../lib/sdk/transforms/MapElements');
const ParDo = require('../../../lib/sdk/transforms/ParDo');
const Pipeline = require('../../../lib/sdk/Pipeline');
const TextIO = require('../../../lib/sdk/io/TextIO');

const main = async () => {
  const p = Pipeline.create()

  p
  .apply(TextIO.read().from(path.resolve(__dirname, '../../fixtures/file2.txt')))
  .apply('ExtractWords', ParDo.of(
    new class ExtractWordsFn extends DoFn {
      processElement(c) {
        c.element()
        .split(/[^\S]+/)
        .forEach(word => word.length && c.output(word))
      }
    }()
  ))

  /**
   * Accumulate count for all elements:
   */

  .apply(Count.globally())

  /**
   * Now we can check the values:
   */

  .apply(ParDo.of(
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

        return require('tap').equal(input, 7)
      }
    }
  ))

  return p
  .run()
  .waitUntilFinish()
}

tap.resolves(main())
