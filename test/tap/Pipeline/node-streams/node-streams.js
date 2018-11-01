const tap = require('tap')

const stream = require('stream')
const fs = require('fs')
const util = require('util')
const zlib = require('zlib')

const pipeline = util.promisify(stream.pipeline)

class DoFn extends stream.Transform {
  _transform(chunk, encoding, callback) {
    this.processElement({
      element: () => encoding === 'buffer' ? chunk.toString() : chunk,
      output: str => this.push(str)
    })
    callback()
  }

  _flush(callback) {
    this.finalElement({
      element: () => encoding === 'buffer' ? chunk.toString() : chunk,
      output: str => this.push(str)
    })
    callback()
  }
}

class SplitNewLineFn extends DoFn {
  processElement(c) {
    if (this.last === undefined) {
      this.last = ''
    }

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

async function main() {
  const source = fs.createReadStream('../../../fixtures/shakespeare/1kinghenryiv')
  const transform = new SplitNewLineFn()
  const sink = fs.createWriteStream('../../../fixtures/output/1kinghenryiv')

  try {
    await pipeline(
      source,
      transform,
      sink
    )

    console.log('Pipeline succeeded')

    const stat = fs.statSync('../../../fixtures/output/1kinghenryiv')
    tap.same(stat.size, 140533)
  } catch (err) {
    console.error('Pipeline failed', err)
  }
}

main()
