const DoFn = require('./DoFn');
const ParDo = require('./ParDo');

/**
 * [TODO] This should be based on PTransform.
 */

class Count {
  static perElement() {
    return ParDo().of(
      new class extends DoFn {
        processStart() {
          this.counts = {};
        }

        processElement(c) {
          const key = c.element();

          this.counts[key] = this.counts[key] || 0;
          this.counts[key]++;
        }

        processFinish(pe) {
          Object.keys(this.counts).forEach(key => {
            pe.output({
              getKey: () => {
                return key;
              },

              getValue: () => {
                return this.counts[key];
              }
            });
          });
        }
      }
    );
  }
}

module.exports = Count;
