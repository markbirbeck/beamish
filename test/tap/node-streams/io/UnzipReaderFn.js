const tap = require('tap')
tap.comment('UnzipReaderFn')

const path = require('path')

const {
  Count,
  DoFn,
  NoopWriterFn,
  ParDo,
  Pipeline,
  Split,
  UnzipReaderFn
} = require('../../../../')

const main = async () => {
  const p = Pipeline.create()

  p
  .apply(
    ParDo.of(
      new UnzipReaderFn(path.resolve(__dirname, '../../../fixtures/file2.txt.zip'))
    )
  )
  .apply(ParDo.of(new Split()))
  .apply(Count.globally())
  .apply(
    ParDo.of(new class extends DoFn {
      processElement(c) {
        c.output(
          tap.same(c.element(), 6).toString()
        )
      }
    })
  )
  .apply(ParDo.of(new NoopWriterFn()))

  return p
  .run()
  .waitUntilFinish()
}

tap.resolves(main())
