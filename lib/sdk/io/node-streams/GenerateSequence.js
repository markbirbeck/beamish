const { checkArgument } = require('../../util/Preconditions')
const AutoValue = require('../../util/AutoValue')
const DoFn = require('./../../harnesses/node-streams/DoFn')
const ParDo = require('./../../harnesses/node-streams/ParDo')
const PTransform = class { }

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

  toBuilder() {
    return new Builder(this)
  }

  static from(from) {
    checkArgument(from >= 0, `Value of from must be non-negative, but was: ${from}`)
    return new Builder()
    .setFrom(from)
    .setTo(-1)
    .build()
  }

  to(to) {
    checkArgument(to === -1 || to >= this.getFrom(),
      `Degenerate range [${this.getFrom()}, ${to})`)
    return this.toBuilder()
    .setTo(to)
    .build()
  }

  expand(input) {
    return input.apply(
      ParDo.of(new GenerateSequenceFn(this.getFrom(), this.getTo()))
    )
  }
}

class Builder extends AutoValue(GenerateSequence) { }

module.exports = GenerateSequence
