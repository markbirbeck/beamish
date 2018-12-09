/**
 * The 'raw' version of a test helps us to integrate a module before
 * factoring it into a library.
 */
const tap = require('tap')
tap.comment('Transform: JSON to CSV')

const path = require('path')

const DoFn = require('./../../../../../lib/sdk/harnesses/node-streams/DoFn')
const FileWriterFn = require('./../../../../../lib/sdk/io/node-streams/FileWriterFn')
const CreateReaderFn = require('./../../../../../lib/sdk/io/node-streams/CreateReaderFn')
const ParDo = require('./../../../../../lib/sdk/harnesses/node-streams/ParDo')
const Pipeline = require('./../../../../../lib/sdk/NodeStreamsPipeline')

tap.test('JSON to CSV', t => {
  t.test('simple objects', t => {
    const p = Pipeline.create()

    p
    .apply(ParDo.of(new CreateReaderFn([
      { a: 1, b: 'two', c: { x: 3, y: 4 }},
      { a: 11, b: 'twelve', c: { x: 13, y: 14 }},
      { a: 21, b: 'twenty-two', c: { x: 23, y: 24 }}
    ])))
    .apply(ParDo.of(new class extends DoFn {
      setup() {

        /**
         * Create a JSON parser. We want all values from all levels, so
         * we specify flatten = true. We're also not bothered about the
         * headers because we're only parsing one line at a time, and if
         * header=true, we'll get the header values repeated every time:
         */
        const JsonToCsvParser = require('json2csv').Parser
        this.parser = new JsonToCsvParser({
          flatten: true,
          header: false
        })
      }

      processElement(c) {
        const input = c.element()
        c.output(this.parser.parse(input))
      }
    }))
    .apply(ParDo.of(new class extends DoFn {
      setup() {
        this.result = []
      }

      processElement(c) {
        const input = c.element()
        this.result.push(input)
      }

      finishBundle(fbc) {
        fbc.output(this.result)
      }
    }))
    .apply(ParDo.of(new class extends DoFn {
      processElement(c) {
        const input = c.element()
        c.output(
          t.same(
            input,
            [
              '1,"two",3,4',
              '11,"twelve",13,14',
              '21,"twenty-two",23,24'
            ]
          )
        )
        t.end()
      }
    }))
    .apply(
      ParDo.of(new FileWriterFn(path.resolve(__dirname,
        '../../../../fixtures/output/transforms-json-to-csv')))
    )

    p.run().waitUntilFinish()
  })
  t.end()
})
