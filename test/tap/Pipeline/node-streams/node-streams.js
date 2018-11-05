const tap = require('tap')

const stream = require('stream')
const fs = require('fs')
const path = require('path')
const util = require('util')
const zlib = require('zlib')

const pipeline = util.promisify(stream.pipeline)

const CountFn = require('./../../../../lib/sdk/transforms/node-streams/CountFn')
const DoFn = require('./../../../../lib/sdk/harnesses/node-streams/DoFn')
const DoFnAsReadable = require('./../../../../lib/sdk/harnesses/node-streams/DoFnAsReadable')
const DoFnAsTransform = require('./../../../../lib/sdk/harnesses/node-streams/DoFnAsTransform')
const DoFnAsWritable = require('./../../../../lib/sdk/harnesses/node-streams/DoFnAsWritable')
const MySqlReader = require('./../../../../lib/sdk/io/node-streams/MySqlReader')
const ElasticSearchWriter = require('./../../../../lib/sdk/io/node-streams/ElasticSearchWriter')

class SplitNewLineFn extends DoFn {
  setup() {
    this.last = ''
  }

  processElement(c) {

    /**
     * Add any leftovers from previous processing to the front of
     * the new data:
     */

    this.last += c.element()

    /**
     * Split the data; we're looking for '\r', '\n', or '\r\n':
     */

    const list = this.last.split(/\r\n|[\r\n]/)

    /**
     * Save the very last entry for next time, since we don't know
     * whether it's a full line or not:
     */

    this.last = list.pop()

    while (list.length) {
      c.output(list.shift())
    }
  }

  finalElement(c) {
    c.output(this.last)
  }
}

class FileReader extends DoFn {
  constructor(fileName) {
    super()
    this.fileName = fileName
  }

  /*
   * Note that there is no need for a teardown() since the default for
   * the writable stream is to auto close:
   */

  setup() {
    this.stream = fs.createReadStream(path.resolve(__dirname, this.fileName))
  }
}

class FileWriter extends DoFn {
  constructor(fileName) {
    super()
    this.fileName = fileName
  }

  /**
   * Note that there is no need for a teardown() since the default for
   * the writable stream is to auto close:
   */

  setup() {
    return new Promise((resolve, reject) => {
      this.stream = fs.createWriteStream(path.resolve(__dirname, this.fileName))
      this.stream.on('ready', resolve)
      this.stream.on('error', reject)
    })
  }
}

function main() {
  tap.test(async t => {
    const steps = [
      new DoFnAsReadable(new FileReader('../../../fixtures/shakespeare/1kinghenryiv')),
      new DoFnAsTransform(new SplitNewLineFn()),
      new DoFnAsTransform(new CountFn()),
      new DoFnAsWritable(new FileWriter('../../../fixtures/output/1kinghenryiv'))
    ]

    try {
      await pipeline(...steps)

      console.log('Pipeline succeeded')

      const stat = fs.statSync('../../../fixtures/output/1kinghenryiv')
      t.same(stat.size, 4)
    } catch (err) {
      console.error('Pipeline failed', err)
    }
    t.done()
  })

  tap.test(async t => {
    const steps = [
      new DoFnAsReadable(
        new MySqlReader({
          connection: {
            host: 'db',
            database: 'employees',
            user: 'root',
            password: 'college'
          },
          query: 'SELECT dept_name FROM departments;'
        })
      ),
      new DoFnAsTransform(new CountFn()),
      new DoFnAsWritable(new FileWriter('../../../fixtures/output/departments'))
    ]

    try {
      await pipeline(...steps)

      console.log('Pipeline succeeded')

      const stat = fs.statSync('../../../fixtures/output/departments')
      t.same(stat.size, 1)
    } catch (err) {
      console.error('Pipeline failed', err)
    }
    t.done()
  })

  tap.test(async t => {
    const steps = [
      new DoFnAsReadable(
        new MySqlReader({
          connection: {
            host: 'db',
            database: 'employees',
            user: 'root',
            password: 'college'
          },
          query: 'SELECT dept_name FROM departments;'
        })
      ),
      new DoFnAsWritable(
        new ElasticSearchWriter({
          connection: {
            host: 'elasticsearch:9200'
          },
          idFn: obj => obj.dept_name,
          type: 'department',
          index: 'departments'
        })
      )
    ]

    try {
      await pipeline(...steps)

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
