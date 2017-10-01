const path = require('path');
const chai = require('chai');

chai.should();

const Pipeline = require('../lib/sdk/Pipeline');
const ParDo = require('../lib/sdk/transforms/ParDo');
const DoFn = require('../lib/sdk/transforms/DoFn');
const TextIO = require('../lib/sdk/io/TextIO');

describe('TextIO', () => {
  describe('read()', () => {
    it('from()', () => {
      Pipeline.create()
      .apply(ParDo().of(
        TextIO.read().from(path.resolve(__dirname, './fixtures/file1.txt'))
      ))
      .apply(ParDo().of(new class extends DoFn {
        processElement(c) {
          c.element().should.eql('This is a simple file.\n');
        }
      }))
      .run()
      ;
    });
  });
});
