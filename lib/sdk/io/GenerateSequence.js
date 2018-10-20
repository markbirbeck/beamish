const DoFn = require('../transforms/DoFn')
const ParDo = require('../transforms/ParDo')
const PTransform = require('../transforms/PTransform')

const hidden = new WeakMap()

class GenerateSequenceFn extends DoFn {
  constructor(from, to) {
    super()
    this.from = from
    this.to = to
  }

  async processElement(c) {
    for (let i = this.from; i <= this.to; i++) {
      await c.output(i)
    }
  }
}

class GenerateSequence extends PTransform {
  constructor(builder) {
    super()
    hidden.set(this, new Map(builder))
  }

  getFrom() {
    return hidden.get(this).get('from')
  }

  getTo() {
    return hidden.get(this).get('to')
  }

  static from(from) {
    return new Builder()
    .setFrom(from)
    .setTo(-1)
    .build()
  }

  to(to) {
    return this.toBuilder()
    .setTo(to)
    .build()
  }

  toBuilder() {
    return new Builder(this)
  }

  expand(input) {
    return input.apply(
      ParDo.of(new GenerateSequenceFn(this.getFrom(), this.getTo()))
    )
  }
}

class Builder {
  constructor(builder) {
    if (builder) {
      this.from = builder.getFrom()
      this.to = builder.getTo()
    }
  }

  setFrom(from) {
    this.from = from
    return this
  }

  setTo(to) {
    this.to = to
    return this
  }

  build() {
    return new GenerateSequence(Object.entries(this))
  }
}

module.exports = GenerateSequence
