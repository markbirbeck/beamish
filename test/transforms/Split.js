const path = require('path');
const chai = require('chai');

chai.should();

const Pipeline = require('../../lib/sdk/Pipeline');
const Create = require('../../lib/sdk/transforms/Create');
const ParDo = require('../../lib/sdk/transforms/ParDo');
const DoFn = require('../../lib/sdk/transforms/DoFn');

describe('Split', () => {
  it('using \\n', async () => {
    await Pipeline.create()
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

          const list = this.last.split('\n');

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
