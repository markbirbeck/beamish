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

const JsonToCsv = require('./../../../../../lib/sdk/transforms/node-streams/JsonToCsv')

tap.test('JSON to CSV', t => {
  t.test('simple objects', t => {
    const p = Pipeline.create()

    p
    .apply(ParDo.of(new CreateReaderFn([
      { a: 1, b: 'two', c: { x: 3, y: 4 }},
      { a: 11, b: 'twelve', c: { x: 13, y: 14 }},
      { a: 21, b: 'twenty-two', c: { x: 23, y: 24 }}
    ])))
    .apply(ParDo.of(new JsonToCsv()))
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

  t.test('simple objects with header', t => {
    const p = Pipeline.create()

    p
    .apply(ParDo.of(new CreateReaderFn([
      { d: 5, e: 'six', f: { x: 7, y: 8 }},
      { d: 15, e: 'sixteen', f: { x: 17, y: 18 }},
      { d: 25, e: 'twenty-six', f: { x: 27, y: 28 }}
    ])))
    .apply(ParDo.of(new JsonToCsv('age,name,x,y')))
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
              'age,name,x,y',
              '5,"six",7,8',
              '15,"sixteen",17,18',
              '25,"twenty-six",27,28'
            ]
          )
        )
        t.end()
      }
    }))
    .apply(
      ParDo.of(new FileWriterFn(path.resolve(__dirname,
        '../../../../fixtures/output/transforms-json-to-csv-with-header')))
    )

    p.run().waitUntilFinish()
  })
  t.end()
})
