const tap = require('tap')
tap.comment('CreateReaderFn')

const path = require('path')
const stream = require('stream')

const { DoFn, FileWriterFn, CreateReaderFn, ParDo, Pipeline } = require('../../../../')

/**
 * Define a DoFn for ParDo:
 */

class SplitLineFn extends DoFn {
  processElement(c) {
    c.element().split(' ').forEach(word => c.output(word))
  }
}

class ComputeWordLengthFn extends DoFn {
  processElement(c) {
    c.output(c.element().length)
  }
}

class MaxFn extends DoFn {
  constructor() {
    super()
    this.max = 0
  }

  processElement(c) {
    this.max = Math.max(this.max, c.element())
  }

  finishBundle(c) {
    c.output(this.max)
  }
}

const main = async () => {
  const p = Pipeline.create()

  p
  .apply(
    ParDo.of(
      new CreateReaderFn([
        'To be, or not to be: that is the question: ',
        'Whether \'tis nobler in the mind to suffer ',
        'The slings and arrows of outrageous fortune, ',
        'Or to take arms against a sea of troubles, '
      ])
    )
  )
  .apply(ParDo.of(new SplitLineFn()))
  .apply(ParDo.of(new ComputeWordLengthFn()))
  .apply(ParDo.of(new MaxFn()))
  .apply(
    ParDo.of(new class extends DoFn {
      processElement(c) {
        c.output(
          tap.same(c.element(), 'outrageous'.length).toString()
        )
      }
    })
  )
  .apply(
    ParDo.of(new FileWriterFn(path.resolve(__dirname,
      '../../../fixtures/output/create')))
  )

  return p
  .run()
  .waitUntilFinish()
}

tap.resolves(main())
