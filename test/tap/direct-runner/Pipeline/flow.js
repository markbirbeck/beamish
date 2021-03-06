/**
 * Check that there is no build up between one pipeline step and
 * the next.
 */

const path = require('path')
const tap = require('tap')
tap.comment('Pipeline flow')

/**
 * Set up a pipeline that:
 *
 *  - generates two items, each with a timestamp;
 *  - adds a further timestamp to each record;
 *  - checks that timestamp 2 in the first record is less than
 *    timestamp 1 in the second record.
 */

const Create = require('../../../../lib/sdk/transforms/Create');
const DoFn = require('../../../../lib/sdk/transforms/DoFn');
const ParDo = require('../../../../lib/sdk/transforms/ParDo');
const Pipeline = require('../../../../lib/sdk/Pipeline');
const TextIO = require('../../../../lib/sdk/io/TextIO');

const main = async () => {
  const p = Pipeline.create()

  /**
   * Generate a couple of records with a timestamp:
   *
   * TODO(MRB): The initial Create.of() does nothing other than pass the test imposed
   * by the pipeline that the first step must be a readable stream. There is probably
   * a better way around this.
   */

  p
  .apply(Create.of(['']))
  .apply(
    'GenerateTimestamps',
    ParDo.of(
      new class extends DoFn {
        async processElement(c) {
          for (let i = 0; i < 2; i++) {
            await c.output({
              ts1: new Date()
            })
          }
        }
      }
    )
  )

  /**
   * Add another timestamp to each record. We want to be adding this second
   * timestamp to record 1 *before* the previous step generates record 2:
   */

  .apply(
    'AddExtraTimestamp',
    ParDo.of(
      new class extends DoFn {
        processElement(c) {
          const input = c.element()
          input.ts2 = new Date()
          c.output(input)
        }
      }
    )
  )

  /**
   * Accumulate the results into one object so that we can compare the
   * timestamps:
   */

  .apply(
    'AccumulateAllResults',
    ParDo.of(
      new class extends DoFn {
        setup() {
          this.results = []
        }

        processElement(c) {
          this.results.push(c.element())
        }

        processFinish(pe) {
          pe.output(this.results)
        }
      }
    )
  )

  /**
   * Ensure that the second timestamp for the first record is *before*
   * the first timestamp for the second record:
   */

  .apply(
    'TestTimestampSequence',
    ParDo.of(
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

          return String(input[0].ts2 < input[1].ts1)
        }
      }
    )
  )
  .apply(TextIO.write().to('flow'))

  return p
  .run()
  .waitUntilFinish()
}

tap.resolves(main())
