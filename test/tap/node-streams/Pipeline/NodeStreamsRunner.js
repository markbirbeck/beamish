const tap = require('tap')
tap.comment('node-streams harness')

const fs = require('fs')
const path = require('path')

const Count = require('./../../../../lib/sdk/transforms/node-streams/Count')
const NodeStreamsRunner = require('./../../../../lib/runners/node-streams/NodeStreamsRunner')
const DoFn = require('./../../../../lib/sdk/harnesses/node-streams/DoFn')
const ParDo = require('./../../../../lib/sdk/harnesses/node-streams/ParDo')
const FileReaderFn = require('./../../../../lib/sdk/io/node-streams/FileReaderFn')
const FileWriterFn = require('./../../../../lib/sdk/io/node-streams/FileWriterFn')
const MySqlReaderFn = require('./../../../../lib/sdk/io/node-streams/MySqlReaderFn')
const ElasticSearchWriterFn = require('./../../../../lib/sdk/io/node-streams/ElasticSearchWriterFn')

function main() {
  tap.test(async t => {
    const graph = [
      ParDo.of(new MySqlReaderFn({
        connection: {
          host: 'db',
          database: 'employees',
          user: 'root',
          password: 'college'
        },
        query: 'SELECT dept_name FROM departments;'
      })),
      Count.globally(),
      ParDo.of(new FileWriterFn(path.resolve(__dirname,
        '../../../fixtures/output/departments')))
    ]

    t.resolves(
      new NodeStreamsRunner()
      .run({ graph })
      .waitUntilFinish()
    )

    const stat = fs.statSync(path.resolve(__dirname,
      '../../../fixtures/output/departments'))
    t.same(stat.size, 1)
    t.done()
  })

  tap.test(async t => {
    const graph = [
      ParDo.of(new MySqlReaderFn({
        connection: {
          host: 'db',
          database: 'employees',
          user: 'root',
          password: 'college'
        },
        query: 'SELECT dept_name FROM departments;'
      })),
      ParDo.of(new ElasticSearchWriterFn({
        connection: {
          host: 'elasticsearch:9200'
        },
        idFn: obj => obj.dept_name,
        type: 'department',
        index: 'departments'
      }))
    ]

    t.resolves(
      new NodeStreamsRunner()
      .run({ graph })
      .waitUntilFinish()
    )

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
    if (err) { throw err }
    main()
  }
)
