const tap = require('tap')
tap.comment('CreateReaderFn')

const path = require('path')
const stream = require('stream')

const CreateReaderFn = require('./../../../../../lib/sdk/io/node-streams/CreateReaderFn')
const DoFn = require('./../../../../../lib/sdk/harnesses/node-streams/DoFn')
const FileWriterFn = require('./../../../../../lib/sdk/io/node-streams/FileWriterFn')
const ParDo = require('./../../../../../lib/sdk/harnesses/node-streams/ParDo')
const Pipeline = require('./../../../../../lib/sdk/NodeStreamsPipeline')
const RequestTransformFn = require('./../../../../../lib/sdk/io/node-streams/RequestTransformFn')

const main = () => {
  const p = Pipeline.create()

  p
  .apply(
    ParDo.of(
      new CreateReaderFn([
        'https://api.postcodes.io/postcodes/sw97de',
        'https://api.postcodes.io/postcodes/e26ex'
      ])
    )
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
  .apply(
    ParDo.of(new FileWriterFn(path.resolve(__dirname,
      '../../../../fixtures/output/request-transform')))
  )

  return p
  .run()
  .waitUntilFinish()
}

tap.resolves(main())
