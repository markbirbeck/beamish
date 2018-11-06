const DoFn = require('./../../harnesses/node-streams/DoFn')
const ParDo = require('./../../harnesses/node-streams/ParDo')

exports.globally = () => ParDo.of(
  new class extends DoFn {
    constructor() {
      super()
      this.objectMode = true
    }

    setup() {
      this.count = 0
    }

    processElement() {
      this.count++
    }

    finishBundle(fbc) {
      fbc.output(String(this.count))
    }
  }
)

exports.perElement = () => ParDo.of(
  new class extends DoFn {
    constructor() {
      super()
      this.objectMode = true
    }

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
