const tap = require('tap')
tap.comment('SpawnFn')

const ChildProcess = require('duplex-child-process')

const {
  Create,
  DoFn,
  NoopWriterFn,
  ParDo,
  Pipeline
} = require('../../../../../')

/**
 * Define a DoFn for ParDo:
 */

class AddCrFn extends DoFn {
  processElement(c) {
    c.output(`${c.element().toString()}\n`)
  }
}

class SpawnFn extends DoFn {
  constructor(cmd, args, options) {
    super()
    this.cmd = cmd
    this.args = args
    this.options = options
  }

  setup() {
    this.stream = new ChildProcess.spawn(this.cmd, this.args, this.options)
  }
}

const main = async () => {
  const p = Pipeline.create()

  p
  .apply(Create.of(['hello', 'world!']))
  .apply(ParDo.of(new AddCrFn()))
  .apply(ParDo.of(new SpawnFn('tr', ['[a-z]', '[A-Z]'])))
  .apply(
    ParDo.of(new class extends DoFn {
      processElement(c) {
        c.output(
          tap.same(c.element().toString(), 'HELLO\nWORLD!\n').toString()
        )
      }
    })
  )
  .apply(ParDo.of(new NoopWriterFn()))

  return p
  .run()
  .waitUntilFinish()
}

tap.resolves(main())
