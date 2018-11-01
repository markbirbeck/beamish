const tap = require('tap')

const stream = require('stream')
const fs = require('fs')
const util = require('util')
const zlib = require('zlib')

const pipeline = util.promisify(stream.pipeline)

const DoFn = require('./../../../../lib/sdk/harnesses/node-streams/DoFn')
const DoFnAsTransform = require('./../../../../lib/sdk/harnesses/node-streams/DoFnAsTransform')

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

class DoFnAsReadable extends stream.Readable {
  constructor(fn) {
    super()
    this.fn = fn
    this.setupComplete = false
    this.teardownComplete = false
  }

  /**
   * When the upstream handler is ready for more, then unpause the
   * wrapped stream. On first pass through set up event handlers:
   */

  _read() {
    if (!this.setupComplete) {
      this.setupComplete = true
      if (this.fn.setup) {
        this.fn.setup()
      }

      /**
       * When there is no more data, let the upstream handler
       * know, and ask the downstream handler to destroy itself:
       */

      this.fn.stream.on('end', () => {
        this.push(null)
        if (!this.teardownComplete) {
          this.teardownComplete = true
          if (this.fn.teardown) {
            this.fn.teardown()
          }
        }
      })

      this.fn.stream.on('data', chunk => {
        if (!this.push(chunk)) {
          this.fn.stream.pause()
        }
      })
    }

    this.fn.stream.resume()
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
    this.stream = fs.createReadStream(this.fileName)
  }
}

async function main() {
  const sink = fs.createWriteStream('../../../fixtures/output/1kinghenryiv')
  const steps = [
    new DoFnAsReadable(new FileReader('../../../fixtures/shakespeare/1kinghenryiv')),
    new DoFnAsTransform(new SplitNewLineFn()),
    new DoFnAsTransform(new CountFn()),
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
