const tap = require('tap')
tap.comment('node-streams harness')

const fs = require('fs')
const path = require('path')

const {
  Count,
  DoFn,
  ElasticSearchWriterFn,
  FileReaderFn,
  FileWriterFn,
  MySqlReaderFn,
  NodeStreamsHarness,
  ParDo
} = require('../../../../')

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
      ParDo.of(new class extends DoFn {
        apply(input) {
          return String(input)
        }
      }),
      ParDo.of(new FileWriterFn(path.resolve(__dirname,
        '../../../fixtures/output/departments')))
    ]

    const harness = new NodeStreamsHarness()
    harness.register(graph)

    await harness.processBundle()

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

    const harness = new NodeStreamsHarness()
    harness.register(graph)

    await harness.processBundle()

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
    if (err) { throw err }
    main()
  }
)
