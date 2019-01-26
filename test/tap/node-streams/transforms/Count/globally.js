const tap = require('tap')
tap.comment('Count#globally')

const path = require('path')

/**
 * Set up a pipeline that:
 *
 *  - reads lines from a file;
 *  - splits each line into its words;
 *  - counts the total number of words;
 *  - checks the count.
 */

const {
  Count,
  DoFn,
  FileReaderFn,
  NoopWriterFn,
  ParDo,
  Pipeline
} = require('../../../../../')

const main = async () => {
  const p = Pipeline.create()

  p
  .apply(
    ParDo.of(new FileReaderFn(path.resolve(__dirname,
      '../../../../fixtures/shakespeare/1kinghenryiv')))
  )
  .apply(
    'ExtractWords',
    ParDo.of(
      new class ExtractWordsFn extends DoFn {
        processElement(c) {
          c.element()
          .split(/[^\S]+/)
          .forEach(word => word.length && c.output(word))
        }
      }(false)
    )
  )
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
        return require('tap').equal(input, 26141).toString()
      }
    }
  ))
  .apply(ParDo.of(new NoopWriterFn()))

  return p
  .run()
  .waitUntilFinish()
}

tap.resolves(main())
