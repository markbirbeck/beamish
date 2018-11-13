const tap = require('tap')

const stream = require('stream')
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')
const util = require('util')

const pipeline = util.promisify(stream.pipeline)

const Count = require('./../../../../lib/sdk/transforms/node-streams/Count')
const DoFn = require('./../../../../lib/sdk/harnesses/node-streams/DoFn')
const DoFnAsReadable = require('./../../../../lib/sdk/harnesses/node-streams/DoFnAsReadable')
const DoFnAsTransform = require('./../../../../lib/sdk/harnesses/node-streams/DoFnAsTransform')
const DoFnAsWritable = require('./../../../../lib/sdk/harnesses/node-streams/DoFnAsWritable')
const ParDo = require('./../../../../lib/sdk/harnesses/node-streams/ParDo')
const FileReaderFn = require('./../../../../lib/sdk/io/node-streams/FileReaderFn')
const FileWriterFn = require('./../../../../lib/sdk/io/node-streams/FileWriterFn')
const MySqlReaderFn = require('./../../../../lib/sdk/io/node-streams/MySqlReaderFn')
const ElasticSearchWriterFn = require('./../../../../lib/sdk/io/node-streams/ElasticSearchWriterFn')

function main() {
  tap.test(async t => {
    const graph = [
      new DoFnAsReadable(ParDo.of(new MySqlReaderFn({
        connection: {
          host: 'db',
          database: 'employees',
          user: 'root',
          password: 'college'
        },
        query: 'SELECT dept_name FROM departments;'
      }))),
      new DoFnAsTransform(Count.globally()),
      new DoFnAsWritable(ParDo.of(new FileWriterFn(path.resolve(__dirname,
        '../../../fixtures/output/departments'))))
    ]

    try {
      let transform
      for (transform of graph) {
        await transform.fn.setup()
      }

      await pipeline(...graph)

      for (transform of graph) {
        await transform.fn.teardown()
      }

      console.log('Pipeline succeeded')

      const stat = fs.statSync(path.resolve(__dirname,
        '../../../fixtures/output/departments'))
      t.same(stat.size, 1)
    } catch (err) {
      console.error('Pipeline failed', err)
    }
    t.done()
  })

  tap.test(async t => {
    const graph = [
      new DoFnAsReadable(ParDo.of(new MySqlReaderFn({
        connection: {
          host: 'db',
          database: 'employees',
          user: 'root',
          password: 'college'
        },
        query: 'SELECT dept_name FROM departments;'
      }))),
      new DoFnAsWritable(ParDo.of(new ElasticSearchWriterFn({
        connection: {
          host: 'elasticsearch:9200'
        },
        idFn: obj => obj.dept_name,
        type: 'department',
        index: 'departments'
      })))
    ]

    try {
      let transform
      for (transform of graph) {
        await transform.fn.setup()
      }

      await pipeline(...graph)

      for (transform of graph) {
        await transform.fn.teardown()
      }

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
