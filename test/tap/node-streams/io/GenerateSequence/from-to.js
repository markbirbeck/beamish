const path = require('path')
const tap = require('tap')
tap.comment('GenerateSequence#from')

/**
 * Set up a pipeline that:
 *
 *  - generates a sequence of numbers;
 *  - sums all of the numbers in the sequence;
 *  - checks that the sum received is the sum expected.
 */

const {
  Create,
  DoFn,
  GenerateSequence,
  NoopWriterFn,
  ParDo,
  Pipeline
} = require('../../../../../')

const main = async () => {
  const p = Pipeline.create()

  /**
   * TODO(MRB): The initial Create.of() does nothing other than pass the test imposed
   * by the pipeline that the first step must be a readable stream. There is probably
   * a better way around this.
   */

  p
  .apply(Create.of(['']))
  .apply(GenerateSequence.from(17).to(720))

  /**
   * Add each of the values received to a running total:
   */

  .apply(ParDo.of(
    new class extends DoFn {
      setup() {
        this.sum = 0
      }

      processElement(c) {
        this.sum += +c.element()
      }

      processFinish(pe) {
        pe.output(this.sum)
      }
    }
  ))

  /**
   * Now we can check the result:
   */

  .apply(ParDo.of(
    new class extends DoFn {
      apply(input) {
        return tap.same(
          input,
          ((from, to) => (from + to) * (to - from + 1) / 2)(17, 720)
        )
      }
    }
  ))
  .apply(ParDo.of(new NoopWriterFn()))

  return p
  .run()
  .waitUntilFinish()
}

tap.resolves(main())
