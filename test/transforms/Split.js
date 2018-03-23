const path = require('path');
const chai = require('chai');

chai.should();

const Pipeline = require('../../lib/sdk/Pipeline');
const Create = require('../../lib/sdk/transforms/Create');
const ParDo = require('../../lib/sdk/transforms/ParDo');
const DoFn = require('../../lib/sdk/transforms/DoFn');
const Split = require('../../lib/sdk/transforms/Split');

describe('Split', () => {
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
});
