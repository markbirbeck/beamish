const tap = require('tap')

const stream = require('stream')
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')
const util = require('util')

const pipeline = util.promisify(stream.pipeline)

const {
  Count,
  DoFn,
  DoFnAsReadable,
  DoFnAsTransform,
  DoFnAsWritable,
  ElasticSearchWriterFn,
  FileReaderFn,
  FileWriterFn,
  MySqlReaderFn,
  ParDo
} = require('../../../../')

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
      new DoFnAsTransform(ParDo.of(new class extends DoFn {
        apply(input) {
          return String(input)
        }
      })),
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
    timeout: 90000
  },
  err => {
    if (err) { throw new Error(err) }
    console.log('Resources are ready')
    main()
  }
)
