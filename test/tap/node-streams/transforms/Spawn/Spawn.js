const tap = require('tap')
tap.comment('SpawnFn')

const path = require('path')
const ChildProcess = require('duplex-child-process')

const DoFn = require('./../../../../../lib/sdk/harnesses/node-streams/DoFn')
const FileWriterFn = require('./../../../../../lib/sdk/io/node-streams/FileWriterFn')
const CreateReaderFn = require('./../../../../../lib/sdk/io/node-streams/CreateReaderFn')
const ParDo = require('./../../../../../lib/sdk/harnesses/node-streams/ParDo')
const Pipeline = require('./../../../../../lib/sdk/NodeStreamsPipeline')

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
  .apply(ParDo.of(new CreateReaderFn(['hello', 'world!'])))
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
  .apply(
    ParDo.of(new FileWriterFn(path.resolve(__dirname,
      '../../../../fixtures/output/spawn-tr')))
  )

  return p
  .run()
  .waitUntilFinish()
}

tap.resolves(main())
