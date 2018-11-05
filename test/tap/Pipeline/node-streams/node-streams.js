const tap = require('tap')

const stream = require('stream')
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

const CountFn = require('./../../../../lib/sdk/transforms/node-streams/CountFn')
const DirectHarness = require('./../../../../lib/sdk/harnesses/node-streams/DirectHarness')
const DoFn = require('./../../../../lib/sdk/harnesses/node-streams/DoFn')
const ParDo = require('./../../../../lib/sdk/harnesses/node-streams/ParDo')
const DoFnAsReadable = require('./../../../../lib/sdk/harnesses/node-streams/DoFnAsReadable')
const DoFnAsTransform = require('./../../../../lib/sdk/harnesses/node-streams/DoFnAsTransform')
const DoFnAsWritable = require('./../../../../lib/sdk/harnesses/node-streams/DoFnAsWritable')
const FileReaderFn = require('./../../../../lib/sdk/io/node-streams/FileReaderFn')
const FileWriterFn = require('./../../../../lib/sdk/io/node-streams/FileWriterFn')
const MySqlReaderFn = require('./../../../../lib/sdk/io/node-streams/MySqlReaderFn')
const ElasticSearchWriterFn = require('./../../../../lib/sdk/io/node-streams/ElasticSearchWriterFn')
const SplitNewLineFn = require('./../../../../lib/sdk/transforms/node-streams/SplitNewLineFn')

function main() {
  tap.test(async t => {
    const graph = [
      new DoFnAsReadable(ParDo.of(new FileReaderFn(path.resolve(__dirname,
        '../../../fixtures/shakespeare/1kinghenryiv')))),
      new DoFnAsTransform(ParDo.of(new SplitNewLineFn())),
      new DoFnAsTransform(ParDo.of(new CountFn())),
      new DoFnAsWritable(ParDo.of(new FileWriterFn(path.resolve(__dirname,
        '../../../fixtures/output/1kinghenryiv'))))
    ]

    try {
      const harness = new DirectHarness()
      harness.register(graph)

      await harness.processBundle()

      console.log('Pipeline succeeded')

      const stat = fs.statSync('../../../fixtures/output/1kinghenryiv')
      t.same(stat.size, 4)
    } catch (err) {
      console.error('Pipeline failed', err)
    }
    t.done()
  })

  tap.test(async t => {
    const graph = [
      new DoFnAsReadable(
        ParDo.of(new MySqlReaderFn({
          connection: {
            host: 'db',
            database: 'employees',
            user: 'root',
            password: 'college'
          },
          query: 'SELECT dept_name FROM departments;'
        }))
      ),
      new DoFnAsTransform(ParDo.of(new CountFn())),
      new DoFnAsWritable(ParDo.of(new FileWriterFn(path.resolve(__dirname,
        '../../../fixtures/output/departments'))))
    ]

    try {
      const harness = new DirectHarness()
      harness.register(graph)

      await harness.processBundle()

      console.log('Pipeline succeeded')

      const stat = fs.statSync('../../../fixtures/output/departments')
      t.same(stat.size, 1)
    } catch (err) {
      console.error('Pipeline failed', err)
    }
    t.done()
  })

  tap.test(async t => {
    const graph = [
      new DoFnAsReadable(
        ParDo.of(new MySqlReaderFn({
          connection: {
            host: 'db',
            database: 'employees',
            user: 'root',
            password: 'college'
          },
          query: 'SELECT dept_name FROM departments;'
        }))
      ),
      new DoFnAsWritable(
        ParDo.of(new ElasticSearchWriterFn({
          connection: {
            host: 'elasticsearch:9200'
          },
          idFn: obj => obj.dept_name,
          type: 'department',
          index: 'departments'
        }))
      )
    ]

    try {
      const harness = new DirectHarness()
      harness.register(graph)

      await harness.processBundle()

      console.log('Pipeline succeeded')
    } catch (err) {
      console.error('Pipeline failed', err)
    }
    t.done()
  })
}

const waitOn = require('wait-on')
waitOn(
  {
    resources: ['tcp:db:3306', 'tcp:elasticsearch:9200'],
    timeout: 30000
  },
  err => {
    if (err) { throw new Error(err) }
    console.log('Resources are ready')
    main()
  }
)
