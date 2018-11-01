const tap = require('tap')

const stream = require('stream')
const fs = require('fs')
const util = require('util')
const zlib = require('zlib')

const pipeline = util.promisify(stream.pipeline)

const DoFn = require('./../../../../lib/sdk/harnesses/node-streams/DoFn')

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

class CountFn extends DoFn {
  setup() {
    this.count = 0
  }

  processElement(c) {
    this.count++
  }

  finalElement(c) {
    c.output('' + this.count)
  }
}

async function main() {
  const source = fs.createReadStream('../../../fixtures/shakespeare/1kinghenryiv')
  const sink = fs.createWriteStream('../../../fixtures/output/1kinghenryiv')
  const steps = [
    source,
    new SplitNewLineFn(),
    new CountFn(),
    sink
  ]

  try {
    await pipeline(...steps)

    console.log('Pipeline succeeded')

    const stat = fs.statSync('../../../fixtures/output/1kinghenryiv')
    tap.same(stat.size, 4)
  } catch (err) {
    console.error('Pipeline failed', err)
  }
}

main()
