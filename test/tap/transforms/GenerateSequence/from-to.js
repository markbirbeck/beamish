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

const DoFn = require('../../../../lib/sdk/transforms/DoFn');
const ParDo = require('../../../../lib/sdk/transforms/ParDo');
const Pipeline = require('../../../../lib/sdk/Pipeline');

const main = async () => {
  const p = Pipeline.create()

  /**
   * Simulate p.apply(GenerateSequence.from(3).to(1007)):
   */

  p
  .apply(ParDo.of(
    new class extends DoFn {
      processStart() {
        this.from = 3
        this.to = 1007
      }

      async processElement(c) {
        for (let i = this.from; i <= this.to; i++) {
          await c.output(i)
        }
      }
    }
  ))

  /**
   * Add each of the values received to a running total:
   */

  .apply(ParDo.of(
    new class extends DoFn {
      processStart() {
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
        return require('tap').same(
          input,
          ((from, to) => (from + to) * (to - from + 1) / 2)(3, 1007)
        )
      }
    }
  ))

  return p
  .run()
  .waitUntilFinish()
}

tap.resolves(main())
