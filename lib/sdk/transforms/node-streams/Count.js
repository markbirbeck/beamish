const DoFn = require('./../../harnesses/direct/DoFn')
const ParDo = require('./../../harnesses/node-streams/ParDo')

exports.globally = () => ParDo.of(
  new class extends DoFn {
    setup() {
      this.count = 0
    }

    processElement() {
      this.count++
    }

    finishBundle(fbc) {
      fbc.output(this.count)
    }
  }
)

exports.perElement = () => ParDo.of(
  new class extends DoFn {
    setup() {
      this.counts = {};
    }

    processElement(c) {
      const key = c.element()

      this.counts[key] = this.counts[key] || 0
      this.counts[key]++
    }

    finishBundle(fbc) {
      Object.keys(this.counts).forEach(key => {
        fbc.output({
          getKey: () => {
            return key
          },

          getValue: () => {
            return this.counts[key]
          }
        })
      })
    }
  }
)
