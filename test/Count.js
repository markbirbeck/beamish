const path = require('path');
const chai = require('chai');

chai.should();

const Pipeline = require('../lib/sdk/Pipeline');
const ParDo = require('../lib/sdk/transforms/ParDo');
const DoFn = require('../lib/sdk/transforms/DoFn');
const TextIO = require('../lib/sdk/io/TextIO');
const Count = require('../lib/sdk/transforms/Count');
const MapElements = require('../lib/sdk/transforms/MapElements');

class OutputFn extends DoFn {
  processElement(c) {
    console.log(c.element());
  }
}

describe('Count', () => {
  it('perElement()', () => {
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
    .apply(ParDo.of(new OutputFn()))
    .run()
    .waitUntilFinish()
    ;
  });
});
