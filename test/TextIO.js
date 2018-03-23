const path = require('path');
const chai = require('chai');

chai.should();

const Pipeline = require('../lib/sdk/Pipeline');
const Count = require('../lib/sdk/transforms/Count');
const Create = require('../lib/sdk/transforms/Create');
const MapElements = require('../lib/sdk/transforms/MapElements');
const ParDo = require('../lib/sdk/transforms/ParDo');
const DoFn = require('../lib/sdk/transforms/DoFn');
const TextIO = require('../lib/sdk/io/TextIO');

describe('TextIO', () => {
  describe('read()', () => {
    it('from()', () => {
      return Pipeline.create()
      .apply(TextIO.read().from(path.resolve(__dirname, './fixtures/file1.txt')))
      .apply(ParDo.of(new class extends DoFn {
        processElement(c) {
          c.element().should.eql('This is a simple file.\n');
        }
      }))
      .run()
      .waitUntilFinish()
      ;
    });

    it('split()', () => {
      return Pipeline.create()
      .apply(ParDo.of(Create.of(['line 1\nline 2\nline 3'])))
      .apply('ExtractLines', ParDo.of(
        new class ExtractLinesFn extends DoFn {
          processStart() {
            this.last = '';
          }

          processElement(c) {

            /**
             * Add any leftovers from previous processing to the front of
             * the new data:
             */

            this.last += c.element();

            /**
             * Split the data:
             */

            const list = this.last.split(/\n/);

            /**
             * Save the very last entry for next time, since we don't know
             * whether it's a full line or not:
             */

            this.last = list.pop();

            /**
             * Propagate all of the lines:
             */

            list.forEach(line => c.output(line));
          }

          processFinish(c) {
            c.output(this.last);
          }
        }()
      ))
      .apply(ParDo.of(new class extends DoFn {
        processStart() {
          this.result = [];
        }

        processElement(c) {
          this.result.push(c.element());
        }

        processFinish() {
          this.result.should.eql(['line 1', 'line 2', 'line 3']);
        }
      }))
      .run()
      .waitUntilFinish()
      ;
    });
  });

  describe('write()', () => {
    it('to()', () => {
      return Pipeline.create()
      .apply(TextIO.read().from(path.resolve(__dirname, './fixtures/file2.txt')))
      .apply('ExtractWords', ParDo.of(
        new class ExtractWordsFn extends DoFn {
          processElement(c) {
            c.element().split('\n').forEach(word => c.output(word));
          }
        }()
      ))
      .apply(Count.perElement())
      .apply(MapElements.via(
        new class extends DoFn {
          apply(input) {
            return `${input.getKey()}: ${input.getValue()}`;
          }
        }()
      ))
      .apply(TextIO.write().to('textio-write-wordcounts'))
      .run()
      .waitUntilFinish()
      ;
    });
  });
});
