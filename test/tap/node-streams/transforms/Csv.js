const tap = require('tap')
tap.comment('Csv')

const path = require('path')
const stream = require('stream')

const Csv = require('./../../../../lib/sdk/transforms/node-streams/Csv')
const DoFn = require('./../../../../lib/sdk/harnesses/node-streams/DoFn')
const FileWriterFn = require('./../../../../lib/sdk/io/node-streams/FileWriterFn')
const CreateReaderFn = require('./../../../../lib/sdk/io/node-streams/CreateReaderFn')
const ParDo = require('./../../../../lib/sdk/harnesses/node-streams/ParDo')
const Pipeline = require('./../../../../lib/sdk/NodeStreamsPipeline')

tap.test('parse', t => {
  t.test('simple row', () => {
    const p = Pipeline.create()

    p
    .apply(ParDo.of(new CreateReaderFn([ 'a,b,c' ])))

    /**
     * When no parameter is passed to the parse function then it
     * will process all rows, and not treat the first row as a
     * header row:
     */

    .apply(ParDo.of(new Csv()))
    .apply(
      ParDo.of(new class extends DoFn {
        processElement(c) {
          c.output(
            tap.same(c.element(), ['a', 'b', 'c']).toString()
          )
        }
      })
    )
    .apply(
      ParDo.of(new FileWriterFn(path.resolve(__dirname,
        '../../../fixtures/output/csv-simple-row')))
    )

    return p.run().waitUntilFinish()
  })

  t.test('whitespace', t => {
    t.test('whitespace is trimmed at the start and end', () => {
      const p = Pipeline.create()

      p
      .apply(ParDo.of(new CreateReaderFn([ '  d,  e ,    f     ' ])))
      .apply(ParDo.of(new Csv()))
      .apply(ParDo.of(new class extends DoFn {
        processElement(c) {
          c.output(
            tap.same(c.element(), ['d', 'e', 'f']).toString()
          )
        }
      }))
      .apply(
        ParDo.of(new FileWriterFn(path.resolve(__dirname,
          '../../../fixtures/output/csv-whitespace-trimmed')))
      )

      return p.run().waitUntilFinish()
    })

    t.test('whitespace is NOT trimmed from within fields', () => {
      const p = Pipeline.create()

      p
      .apply(ParDo.of(new CreateReaderFn([ '  hello,  world ,    is    it   me     ' ])))
      .apply(ParDo.of(new Csv()))
      .apply(ParDo.of(new class extends DoFn {
        processElement(c) {
          c.output(
            tap.same(c.element(), ['hello', 'world', 'is    it   me']).toString()
          )
        }
      }))
      .apply(
        ParDo.of(new FileWriterFn(path.resolve(__dirname,
          '../../../fixtures/output/csv-whitespace-not-trimmed')))
      )

      return p.run().waitUntilFinish()
    })

    t.end()
  })

  t.test('quotes', t => {
    t.test('quotes can be used around fields', () => {
      const p = Pipeline.create()

      p
      .apply(ParDo.of(new CreateReaderFn([ '"g","h","i"' ])))
      .apply(ParDo.of(new Csv()))
      .apply(ParDo.of(new class extends DoFn {
        processElement(c) {
          c.output(
            tap.same(c.element(), ['g', 'h', 'i']).toString()
          )
        }
      }))
      .apply(
        ParDo.of(new FileWriterFn(path.resolve(__dirname,
          '../../../fixtures/output/quotes-around-fields')))
      )

      return p.run().waitUntilFinish()
    })

    t.test('whitespace inside quotes is preserved', () => {
      const p = Pipeline.create()

      p
      .apply(ParDo.of(new CreateReaderFn([ '"j ","  k ","   l"' ])))
      .apply(ParDo.of(new Csv()))
      .apply(ParDo.of(new class extends DoFn {
        processElement(c) {
          c.output(
            tap.same(c.element(), ['j ', '  k ', '   l']).toString()
          )
        }
      }))
      .apply(
        ParDo.of(new FileWriterFn(path.resolve(__dirname,
          '../../../fixtures/output/quotes-containing-whitespace')))
      )

      return p.run().waitUntilFinish()
    })

    t.test('escaped quotes inside quotes are preserved', () => {
      const p = Pipeline.create()

      /**
       * Note that two double-quotes are used to escape a double-quote:
       */

      p
      .apply(ParDo.of(new CreateReaderFn([ '"""m"" "," "" n"" ","   o"' ])))
      .apply(ParDo.of(new Csv()))
      .apply(ParDo.of(new class extends DoFn {
        processElement(c) {
          c.output(
            tap.same(c.element(), ['"m" ', ' " n" ', '   o']).toString()
          )
        }
      }))
      .apply(
        ParDo.of(new FileWriterFn(path.resolve(__dirname,
          '../../../fixtures/output/quotes-containing-quotes')))
      )

      return p.run().waitUntilFinish()
    })

    t.end()
  })

  t.test('row with comments before and after', () => {
    const p = Pipeline.create()

    p
    .apply(ParDo.of(new CreateReaderFn([
      '# A comment that should be skipped',
      'p,  q,r',
      '# And another comment that should be skipped'
    ])))
    .apply(ParDo.of(new Csv()))
    .apply(ParDo.of(new class extends DoFn {
      processElement(c) {
        c.output(
          tap.same(c.element(), ['p', 'q', 'r']).toString()
        )
      }
    }))
    .apply(
      ParDo.of(new FileWriterFn(path.resolve(__dirname,
        '../../../fixtures/output/comments')))
    )

    return p.run().waitUntilFinish()
  })

  t.test('parse to JSON', t => {
    t.test('single object', () => {
      const p = Pipeline.create()

      p
      .apply(ParDo.of(new CreateReaderFn([
        'height,width,length',
        '100,200,300'
      ])))

      /**
       * Setting the parameter to true means that first row is used
       * as a header and then subsequent rows are placed in an object
       * with properties named according to the header:
       */

      .apply(ParDo.of(new Csv(true)))
      .apply(ParDo.of(new class extends DoFn {
        processElement(c) {

          /**
           * The parser can be set to return objects of the correct type,
           * but we haven't done that here, so we must test for strings:
           */

          c.output(
            tap.same(
              c.element(),
              {
                height: '100',
                width: '200',
                length: '300'
              }
            ).toString()
          )
        }
      }))
      .apply(
        ParDo.of(new FileWriterFn(path.resolve(__dirname,
          '../../../fixtures/output/json-single-object')))
      )

      return p.run().waitUntilFinish()
    })

    t.test('multiple objects', () => {
      const p = Pipeline.create()

      p
      .apply(ParDo.of(new CreateReaderFn([
        'friends,romans,countrymen',
        '# Test some leading whitespace',
        '1,  2,3',
        '# Test having quotes and trailing whitespace',
        '4,"5",6  ',
        '# Test having leading and trailing whitespace',
        '7, 8  ,"9"'
      ])))
      .apply(ParDo.of(new Csv(true)))
      .apply(ParDo.of(new class extends DoFn {
        setup() {
          this.result = {}
        }

        processElement(c) {
          const obj = c.element()

          Object.keys(obj).forEach(key => {
            if (!this.result[key]) {
              this.result[key] = 0
            }

            /**
             * The parser can be set to return objects of the correct type,
             * but we haven't done that here, so ensure the string becomes
             * an integer:
             */

            this.result[key] += +obj[key]
          })
        }

        finishBundle(fbc) {
          fbc.output(
            tap.same(
              this.result,
              {
                friends: 12,
                romans: 15,
                countrymen: 18
              }
            ).toString()
          )
        }
      }))
      .apply(
        ParDo.of(new FileWriterFn(path.resolve(__dirname,
          '../../../fixtures/output/json-multiple-objects')))
      )

      return p.run().waitUntilFinish()
    })

    t.test('error handling', () => {
      const p = Pipeline.create()

      p
      .apply(ParDo.of(new CreateReaderFn([
        'x,y,z',
        '# This row is correct',
        '20,30,40',
        '# This one has too few columns',
        'hello,world',
        '# And this one has too many',
        '1,2,3,4'
      ])))
      .apply(ParDo.of(new Csv(true)))
      .apply(ParDo.of(new class extends DoFn {
        setup() {
          this.result = {}
        }

        processElement(c) {
          const obj = c.element()

          Object.keys(obj).forEach(key => {
            if (!this.result[key]) {
              this.result[key] = 0
            }

            /**
             * The parser can be set to return objects of the correct type,
             * but we haven't done that here, so ensure the string becomes
             * an integer:
             */

            this.result[key] += +obj[key]
          })
        }

        finishBundle(fbc) {
          fbc.output(
            tap.same(
              this.result,
              {
                x: 20,
                y: 30,
                z: 40
              }
            ).toString()
          )
        }
      }))
      .apply(
        ParDo.of(new FileWriterFn(path.resolve(__dirname,
          '../../../fixtures/output/csv-error-handling')))
      )

      return p.run().waitUntilFinish()
    })

    t.end()
  })

  t.end()
})
