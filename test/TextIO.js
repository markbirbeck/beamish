const path = require('path');
const chai = require('chai');

chai.should();

const Pipeline = require('../lib/sdk/Pipeline');
const Count = require('../lib/sdk/transforms/Count');
const MapElements = require('../lib/sdk/transforms/MapElements');
const ParDo = require('../lib/sdk/transforms/ParDo');
const DoFn = require('../lib/sdk/transforms/DoFn');
const TextIO = require('../lib/sdk/io/TextIO');

describe('TextIO', () => {
  describe('read()', () => {
    it('from()', () => {
      const p = Pipeline.create()

      p
      .apply(TextIO.read().from(path.resolve(__dirname, './fixtures/file1.txt')))
      .apply(ParDo.of(new class extends DoFn {
        processElement(c) {
          c.element().should.eql('This is a simple file.');
        }
      }))

      return p
      .run()
      .waitUntilFinish()
      ;
    });

    describe('line count', () => {
      it('shakespeare', () => {
        const p = Pipeline.create()

        p
        .apply(TextIO.read().from(path.resolve(__dirname, './fixtures/shakespeare/1kinghenryiv')))
        .apply('Count', ParDo.of(
          new class extends DoFn {
            processStart() {
              this.count = 0;
            }

            processElement() {
              this.count++;
            }

            processFinish(pe) {
              pe.output(this.count);
            }
          }
        ))
        .apply('Check', ParDo.of(
          new class extends DoFn {
            apply(input) {
              input.should.equal(4469);
            }
          }
        ))

        return p
        .run()
        .waitUntilFinish()
        ;
      });

      /**
       * This is a very long running test so leave it disabled until it's needed:
       */

      it.skip('companies house', function() {
        this.timeout(0);
        const p = Pipeline.create()

        p
        .apply(TextIO.read().from(path.resolve(__dirname, './fixtures/companies-house/BasicCompanyData-2018-03-01-part1_5.csv')))
        .apply('Count', ParDo.of(
          new class extends DoFn {
            processStart() {
              this.count = 0;
            }

            processElement() {
              this.count++;
            }

            processFinish(pe) {
              pe.output(this.count);
            }
          }
        ))
        .apply('Check', ParDo.of(
          new class extends DoFn {
            apply(input) {
              input.should.equal(850000);
            }
          }
        ))

        return p
        .run()
        .waitUntilFinish()
        ;
      });
    });

    it('word count', () => {
      const p = Pipeline.create()

      p
      .apply(TextIO.read().from(path.resolve(__dirname, './fixtures/shakespeare/1kinghenryiv')))
      .apply('ExtractWords', ParDo.of(
        new class ExtractWordsFn extends DoFn {
          processElement(c) {
            c.element().toString().toLowerCase()
            .split(/[^\S]+/)
            .forEach(word => word.length && c.output(word))
            ;
          }
        }()
      ))
      .apply('Count', ParDo.of(
        new class extends DoFn {
          processStart() {
            this.count = 0;
          }

          processElement() {
            this.count++;
          }

          processFinish(pe) {
            pe.output(this.count);
          }
        }
      ))
      .apply('Check', ParDo.of(
        new class extends DoFn {
          apply(input) {
            input.should.equal(26141);
          }
        }
      ))

      return p
      .run()
      .waitUntilFinish()
      ;
    });
  });

  describe('write()', () => {
    it('to()', () => {
      const p = Pipeline.create()

      p
      .apply(TextIO.read().from(path.resolve(__dirname, './fixtures/file2.txt')))
      .apply(Count.perElement())
      .apply(MapElements.via(
        new class extends DoFn {
          apply(input) {
            return `${input.getKey()}: ${input.getValue()}`;
          }
        }()
      ))
      .apply(TextIO.write().to(path.resolve(__dirname, './fixtures/output/textio-write-wordcounts')))

      return p
      .run()
      .waitUntilFinish()
      ;
    });
  });
});
