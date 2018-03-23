const path = require('path');
const chai = require('chai');

chai.should();

const Pipeline = require('../lib/sdk/Pipeline');
const ParDo = require('../lib/sdk/transforms/ParDo');
const DoFn = require('../lib/sdk/transforms/DoFn');
const TextIO = require('../lib/sdk/io/TextIO');
const Create = require('../lib/sdk/transforms/Create');
const Csv = require('../lib/sdk/transforms/Csv');

describe('Csv', () => {
  describe('parse', () => {
    it('simple row', async () => {
      await Pipeline.create()
      .apply(ParDo.of(Create.of([ 'a,b,c' ])))

      /**
       * When no parameter is passed to the parse function then it
       * will process all rows:
       */

      .apply(ParDo.of(new Csv()))
      .apply(ParDo.of(new class extends DoFn {
        processElement(c) {
          const row = c.element();

          row.should.have.lengthOf(3);
          row.should.eql(['a', 'b', 'c']);
        }
      }))
      .run()
      .waitUntilFinish()
      ;
    });

    describe('whitespace', () => {
      it('whitespace is trimmed at the start and end', async () => {
        await Pipeline.create()
        .apply(ParDo.of(Create.of([ '  d,  e ,    f     ' ])))
        .apply(ParDo.of(new Csv()))
        .apply(ParDo.of(new class extends DoFn {
          processElement(c) {
            const row = c.element();

            row.should.have.lengthOf(3);
            row.should.eql(['d', 'e', 'f']);
          }
        }))
        .run()
        .waitUntilFinish()
        ;
      });

      it('whitespace is NOT trimmed from within fields', async () => {
        await Pipeline.create()
        .apply(ParDo.of(Create.of([ '  hello,  world ,    is    it   me     ' ])))
        .apply(ParDo.of(new Csv()))
        .apply(ParDo.of(new class extends DoFn {
          processElement(c) {
            const row = c.element();

            row.should.have.lengthOf(3);
            row.should.eql(['hello', 'world', 'is    it   me']);
          }
        }))
        .run()
        .waitUntilFinish()
        ;
      });
    });

    describe('quotes', async () => {
      it('quotes can be used around fields', async () => {
        await Pipeline.create()
        .apply(ParDo.of(Create.of([ '"g","h","i"' ])))
        .apply(ParDo.of(new Csv()))
        .apply(ParDo.of(new class extends DoFn {
          processElement(c) {
            const row = c.element();

            row.should.have.lengthOf(3);
            row.should.eql(['g', 'h', 'i']);
          }
        }))
        .run()
        .waitUntilFinish()
        ;
      });

      it('whitespace inside quotes is preserved', async () => {
        await Pipeline.create()
        .apply(ParDo.of(Create.of([ '"j ","  k ","   l"' ])))
        .apply(ParDo.of(new Csv()))
        .apply(ParDo.of(new class extends DoFn {
          processElement(c) {
            const row = c.element();

            row.should.have.lengthOf(3);
            row.should.eql(['j ', '  k ', '   l']);
          }
        }))
        .run()
        .waitUntilFinish()
        ;
      });

      it('escaped quotes inside quotes are preserved', async () => {
        await Pipeline.create()

        /**
         * Note that two double-quotes are used to escape a double-quote:
         */

        .apply(ParDo.of(Create.of([ '"""m"" "," "" n"" ","   o"' ])))
        .apply(ParDo.of(new Csv()))
        .apply(ParDo.of(new class extends DoFn {
          processElement(c) {
            const row = c.element();

            row.should.have.lengthOf(3);
            row.should.eql(['"m" ', ' " n" ', '   o']);
          }
        }))
        .run()
        .waitUntilFinish()
        ;
      });
    });

    it('row with comments before and after', async () => {
      await Pipeline.create()
      .apply(ParDo.of(Create.of([
        '# A comment that should be skipped',
        'p,  q,r',
        '# And another comment that should be skipped'
      ])))
      .apply(ParDo.of(new Csv()))
      .apply(ParDo.of(new class extends DoFn {
        processElement(c) {
          const row = c.element();

          row.should.have.lengthOf(3);
          row.should.eql(['p', 'q', 'r']);
        }
      }))
      .run()
      .waitUntilFinish()
      ;
    });

    describe('parse to JSON', async () => {
      it('single object', async () => {
        await Pipeline.create()
        .apply(ParDo.of(Create.of([
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
            const obj = c.element();

            /**
             * The parser can be set to return objects of the correct type,
             * but we haven't done that here, so we must test for strings:
             */

            obj.should.eql({
              height: '100',
              width: '200',
              length: '300'
            });
          }
        }))
        .run()
        .waitUntilFinish()
        ;
      });

      it('multiple objects', async () => {
        await Pipeline.create()
        .apply(ParDo.of(Create.of([
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
          processStart() {
            this.result = {};
          }

          processElement(c) {
            const obj = c.element();

            Object.keys(obj).forEach(key => {
              if (!this.result[key]) {
                this.result[key] = 0;
              }

              /**
               * The parser can be set to return objects of the correct type,
               * but we haven't done that here, so ensure the string becomes
               * an integer:
               */

              this.result[key] += +obj[key];
            });
          }

          processFinish() {
            this.result.should.eql({
              friends: 12,
              romans: 15,
              countrymen: 18
            });
          }
        }))
        .run()
        .waitUntilFinish()
        ;
      });
    });
  });
});
