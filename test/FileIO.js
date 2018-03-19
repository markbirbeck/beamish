const path = require('path');
const chai = require('chai');

chai.should();

const Pipeline = require('../lib/sdk/Pipeline');
const Count = require('../lib/sdk/transforms/Count');
const MapElements = require('../lib/sdk/transforms/MapElements');
const ParDo = require('../lib/sdk/transforms/ParDo');
const DoFn = require('../lib/sdk/transforms/DoFn');
const FileIO = require('../lib/sdk/io/FileIO');

describe('FileIO', () => {
  describe('read()', () => {
    it('from()', () => {
      return Pipeline.create()

      /**
       * Read a JPEG and check that it really is a JPEG and is of the
       * right length:
       */

      .apply(FileIO.read().from(path.resolve(__dirname, './fixtures/beamish.jpeg')))
      .apply(ParDo.of(new class extends DoFn {
        processElement(c) {
          const buf = c.element();
          buf[0].should.equal(255);
          buf[1].should.equal(216);
          buf[2].should.equal(255);
          buf.length.should.equal(13470);
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

      /**
       * Read a JPEG and then save it to the output directory:
       */

      .apply(FileIO.read().from(path.resolve(__dirname, './fixtures/beamish.jpeg')))
      .apply(FileIO.write().to(path.resolve(__dirname, './fixtures/output/beamish2.jpeg')))

      /**
       * Now read the file that was written and check that it's correct:
       */

      .apply(FileIO.read().from(path.resolve(__dirname, './fixtures/output/beamish2.jpeg')))
      .apply(ParDo.of(new class extends DoFn {
        processElement(c) {
          const buf = c.element();
          buf[0].should.equal(255);
          buf[1].should.equal(216);
          buf[2].should.equal(255);
          buf.length.should.equal(13470);
        }
      }))
      .run()
      .waitUntilFinish()
      ;
    });
  });
});
