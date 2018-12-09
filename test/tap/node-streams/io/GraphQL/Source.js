const tap = require('tap')
tap.comment('GraphQL Source')

const path = require('path')

const DoFn = require('./../../../../../lib/sdk/harnesses/node-streams/DoFn')
const FileWriterFn = require('./../../../../../lib/sdk/io/node-streams/FileWriterFn')
const CreateReaderFn = require('./../../../../../lib/sdk/io/node-streams/CreateReaderFn')
const ParDo = require('./../../../../../lib/sdk/harnesses/node-streams/ParDo')
const Pipeline = require('./../../../../../lib/sdk/NodeStreamsPipeline')

tap.test('GraphQL Source', t => {
  const p = Pipeline.create()

  p
  .apply(ParDo.of(new CreateReaderFn([ 'hello, world!' ])))
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
  .apply(
    ParDo.of(new FileWriterFn(path.resolve(__dirname,
      '../../../../fixtures/output/graphql-source')))
  )

  p.run().waitUntilFinish()
})
