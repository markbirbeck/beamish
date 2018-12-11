const tap = require('tap')

const fs = require('fs')
const path = require('path')

const NodeStreamsHarness = require('./../../../../lib/sdk/harnesses/node-streams/NodeStreamsHarness')
const DoFn = require('./../../../../lib/sdk/harnesses/node-streams/DoFn')
const ParDo = require('./../../../../lib/sdk/harnesses/node-streams/ParDo')
const FileWriterFn = require('./../../../../lib/sdk/io/node-streams/FileWriterFn')
const RequestReaderFn = require('./../../../../lib/sdk/io/node-streams/RequestReaderFn')

const main = async () => {
  const graph = [
    ParDo.of(new RequestReaderFn('https://api.postcodes.io/postcodes/sw97de')),
    ParDo.of(new class extends DoFn {
      processElement(c) {
        c.output(JSON.parse(c.element()))
      }
    }),
    ParDo.of(new class extends DoFn {
      processElement(c) {
        c.output(c.element().result)
      }
    }),
    ParDo.of(new class extends DoFn {
      processElement(c) {
        c.output(
          tap.same(
            c.element().longitude,
            -0.114056
          )
        )
      }
    }),
    ParDo.of(new class extends DoFn {
      processElement(c) {
        c.output(JSON.stringify(c.element()))
      }
    }),
    ParDo.of(new FileWriterFn(path.resolve(__dirname,
      '../../../fixtures/output/request')))
  ]

  const harness = new NodeStreamsHarness()
  harness.register(graph)

  await harness.processBundle()

  const stat = fs.statSync(path.resolve(__dirname,
    '../../../fixtures/output/request'))
  tap.same(stat.size, 'true'.length)
}

const waitOn = require('wait-on')
waitOn(
  {
    resources: ['https://api.postcodes.io'],
    timeout: 30000
  },
  err => {
    if (err) { throw new Error(err) }
    console.error('Resources are ready')
    main()
  }
)
