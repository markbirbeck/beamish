const path = require('path');
const chai = require('chai');

chai.should();

const Pipeline = require('../../lib/sdk/Pipeline');
const Create = require('../../lib/sdk/transforms/Create');
const ParDo = require('../../lib/sdk/transforms/ParDo');
const DoFn = require('../../lib/sdk/transforms/DoFn');
const Split = require('../../lib/sdk/transforms/Split');

describe('Split', () => {
  describe('delimiters', () => {
    it('using \\n', async () => {
      await Pipeline.create()
      .apply(ParDo.of(Create.of(['line 1\nline 2\nline 3'])))
      .apply('Split', ParDo.of(new Split()))
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

    it('using \\r', async () => {
      await Pipeline.create()
      .apply(ParDo.of(Create.of(['line 4\rline 5\rline 6'])))
      .apply('Split', ParDo.of(new Split()))
      .apply(ParDo.of(new class extends DoFn {
        processStart() {
          this.result = [];
        }

        processElement(c) {
          this.result.push(c.element());
        }

        processFinish() {
          this.result.should.eql(['line 4', 'line 5', 'line 6']);
        }
      }))
      .run()
      .waitUntilFinish()
      ;
    });

    it('using \\r\\n', async () => {
      await Pipeline.create()
      .apply(ParDo.of(Create.of(['line 7\r\nline 8\r\nline 9'])))
      .apply('Split', ParDo.of(new Split()))
      .apply(ParDo.of(new class extends DoFn {
        processStart() {
          this.result = [];
        }

        processElement(c) {
          this.result.push(c.element());
        }

        processFinish() {
          this.result.should.eql(['line 7', 'line 8', 'line 9']);
        }
      }))
      .run()
      .waitUntilFinish()
      ;
    });
  });

  describe('when last line ends with delimiter', () => {
    it('it is not a blank line', async () => {
      await Pipeline.create()
      .apply(ParDo.of(Create.of(['line 10\nline 11\nline 12\n'])))
      .apply('Split', ParDo.of(new Split()))
      .apply(ParDo.of(new class extends DoFn {
        processStart() {
          this.result = [];
        }

        processElement(c) {
          this.result.push(c.element());
        }

        processFinish() {
          this.result.should.eql(['line 10', 'line 11', 'line 12']);
        }
      }))
      .run()
      .waitUntilFinish()
      ;
    });

    it('preceding line can be blank', async () => {
      await Pipeline.create()
      .apply(ParDo.of(Create.of(['line 13\nline 14\nline 15\n\n'])))
      .apply('Split', ParDo.of(new Split()))
      .apply(ParDo.of(new class extends DoFn {
        processStart() {
          this.result = [];
        }

        processElement(c) {
          this.result.push(c.element());
        }

        processFinish() {
          this.result.should.eql(['line 13', 'line 14', 'line 15', '']);
        }
      }))
      .run()
      .waitUntilFinish()
      ;
    });
  });
});
