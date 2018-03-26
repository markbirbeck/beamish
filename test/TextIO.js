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
      return Pipeline.create()
      .apply(TextIO.read().from(path.resolve(__dirname, './fixtures/file1.txt')))
      .apply(ParDo.of(new class extends DoFn {
        processElement(c) {
          c.element().should.eql('This is a simple file.');
        }
      }))
      .run()
      .waitUntilFinish()
      ;
    });

    it('line count', () => {
      return Pipeline.create()
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
      .run()
      .waitUntilFinish()
      ;
    });

    it('word count', () => {
      return Pipeline.create()
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
      .apply(TextIO.write().to(path.resolve(__dirname, './fixtures/output/textio-write-wordcounts')))
      .run()
      .waitUntilFinish()
      ;
    });
  });
});
