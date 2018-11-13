const tap = require('tap')
tap.comment('UnzipReaderFn')

const path = require('path')
const stream = require('stream')

const Count = require('./../../../../lib/sdk/transforms/node-streams/Count')
const DoFn = require('./../../../../lib/sdk/harnesses/node-streams/DoFn')
const FileWriterFn = require('./../../../../lib/sdk/io/node-streams/FileWriterFn')
const ParDo = require('./../../../../lib/sdk/harnesses/node-streams/ParDo')
const Pipeline = require('./../../../../lib/sdk/NodeStreamsPipeline')
const Split = require('./../../../../lib/sdk/transforms/node-streams/Split')
const UnzipReaderFn = require('./../../../../lib/sdk/io/node-streams/UnzipReaderFn')

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
  .apply(
    ParDo.of(new FileWriterFn(path.resolve(__dirname,
      '../../../fixtures/output/create')))
  )

  return p
  .run()
  .waitUntilFinish()
}

tap.resolves(main())
