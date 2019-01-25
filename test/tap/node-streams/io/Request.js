const tap = require('tap')

const fs = require('fs')
const path = require('path')

const {
  DoFn,
  NodeStreamsHarness,
  NoopWriterFn,
  ParDo,
  RequestReaderFn
} = require('../../../../')

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
    ParDo.of(new NoopWriterFn())
  ]

  const harness = new NodeStreamsHarness()
  harness.register(graph)

  await harness.processBundle()
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
