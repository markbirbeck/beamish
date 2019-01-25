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
  ParDo,
  Pipeline
} = require('../../../../')

function main() {
  tap.test(async t => {
    const p = Pipeline.create()

    p
    .apply(
      ParDo.of(new MySqlReaderFn({
        connection: {
          host: 'db',
          database: 'employees',
          user: 'root',
          password: 'college'
        },
        query: 'SELECT dept_name FROM departments;'
      }))
    )
    .apply(Count.globally())
    .apply(
      ParDo.of(new FileWriterFn(path.resolve(__dirname,
        '../../../fixtures/output/departments')))
    )

    t.resolves(
      p
      .run()
      .waitUntilFinish()
    )

    const stat = fs.statSync(path.resolve(__dirname,
      '../../../fixtures/output/departments'))
    t.same(stat.size, 1)
    t.done()
  })

  tap.test(async t => {
    const p = Pipeline.create()

    p
    .apply(
      ParDo.of(new MySqlReaderFn({
        connection: {
          host: 'db',
          database: 'employees',
          user: 'root',
          password: 'college'
        },
        query: 'SELECT dept_name FROM departments;'
      }))
    )
    .apply(
      ParDo.of(new ElasticSearchWriterFn({
        connection: {
          host: 'elasticsearch:9200'
        },
        idFn: obj => obj.dept_name,
        type: 'department',
        index: 'departments'
      }))
    )

    t.resolves(
      p
      .run()
      .waitUntilFinish()
    )

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
