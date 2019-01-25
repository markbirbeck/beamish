const tap = require('tap')
tap.comment('GraphQL Source')

const {
  DoFn,
  Create,
  NoopWriterFn,
  ParDo,
  Pipeline
} = require('../../../../../')

tap.test('GraphQL Source', t => {
  const p = Pipeline.create()

  p
  .apply(Create.of([ 'hello, world!' ]))
  .apply(
    ParDo.of(new class extends DoFn {
      processElement(c) {
        c.output(
          t.same(c.element(), 'hello, world!').toString()
        )
        t.end()
      }
    })
  )
  .apply(ParDo.of(new NoopWriterFn()))

  p.run().waitUntilFinish()
})
