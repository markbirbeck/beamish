const path = require('path')
const tap = require('tap')
tap.comment('Count#perElement')

/**
 * Set up a pipeline that:
 *
 *  - reads lines from a file;
 *  - treats each line as a word;
 *  - counts the occurrence of each word;
 *  - checks the count.
 */

const {
  Count,
  DoFn,
  MapElements,
  NoopWriterFn,
  ParDo,
  Pipeline,
  TextIO
} = require('../../../../../')

const main = async () => {
  const p = Pipeline.create()

  p
  .apply(TextIO.read().from(path.resolve(__dirname, '../../../../fixtures/file2.txt')))
  .apply('ExtractWords', ParDo.of(
    new class ExtractWordsFn extends DoFn {
      processElement(c) {
        c.element()
        .split(/[^\S]+/)
        .forEach(word => word.length && c.output(word))
      }
    }(false)
  ))

  /**
   * Accumulate counts for each element:
   */

  .apply(Count.perElement())

  /**
   * When the counting has completed we get a number of key/value pairs that
   * describe the counts, so place them in a single object:
   */

  .apply(MapElements.via(
    new class extends DoFn {
      setup() {
        this.results = {}
      }

      processElement(c) {
        const input = c.element()
        this.results[input.getKey()] = input.getValue()
      }

      processFinish(pe) {
        pe.output(this.results)
      }
    }
  ))

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

        return tap.same(
          input,
          {
            au: 1,
            goodbye: 1,
            hello: 3,
            revoir: 2
          }
        ).toString()
      }
    }
  ))
  .apply(ParDo.of(new NoopWriterFn()))

  return p
  .run()
  .waitUntilFinish()
}

tap.resolves(main())
