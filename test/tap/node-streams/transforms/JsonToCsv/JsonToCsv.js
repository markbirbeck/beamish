const tap = require('tap')
tap.comment('Transform: JSON to CSV')

const {
  Create,
  DoFn,
  JsonToCsv,
  NoopWriterFn,
  ParDo,
  Pipeline
} = require('../../../../../')

tap.test('JSON to CSV', t => {
  t.test('simple objects', t => {
    const p = Pipeline.create()

    p
    .apply(Create.of([
      { a: 1, b: 'two', c: { x: 3, y: 4 }},
      { a: 11, b: 'twelve', c: { x: 13, y: 14 }},
      { a: 21, b: 'twenty-two', c: { x: 23, y: 24 }}
    ]))
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
          ).toString()
        )
        t.end()
      }
    }))
    .apply(ParDo.of(new NoopWriterFn()))

    p.run().waitUntilFinish()
  })

  t.test('simple objects with header', t => {
    const p = Pipeline.create()

    p
    .apply(Create.of([
      { d: 5, e: 'six', f: { x: 7, y: 8 }},
      { d: 15, e: 'sixteen', f: { x: 17, y: 18 }},
      { d: 25, e: 'twenty-six', f: { x: 27, y: 28 }}
    ]))
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
          ).toString()
        )
        t.end()
      }
    }))
    .apply(ParDo.of(new NoopWriterFn()))

    p.run().waitUntilFinish()
  })
  t.end()
})
