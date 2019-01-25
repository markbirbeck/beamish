const tap = require('tap')
tap.comment('RequestTransformFn')

const {
  Create,
  DoFn,
  NoopWriterFn,
  ParDo,
  Pipeline,
  RequestTransformFn
} = require('../../../../../')

const main = () => {
  const p = Pipeline.create()

  p
  .apply(
    Create.of([
      'https://api.postcodes.io/postcodes/sw97de',
      'https://api.postcodes.io/postcodes/e26ex'
    ])
  )
  .apply(ParDo.of(new RequestTransformFn(true)))
  .apply(ParDo.of(
    new class extends DoFn {
      processElement(c) {
        c.output(c.element().result)
      }
    }
  ))
  .apply(ParDo.of(
    new class extends DoFn {
      processElement(c) {
        c.output(JSON.stringify(c.element()))
      }
    }
  ))
  .apply(ParDo.of(new NoopWriterFn()))

  return p
  .run()
  .waitUntilFinish()
}

tap.resolves(main())
