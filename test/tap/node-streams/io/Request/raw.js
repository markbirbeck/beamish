/**
 * Implement requests as a transform, using only Node streams:
 */

const tap = require('tap')

/**
 * For input, output and transform streams:
 */

const fetch = require('node-fetch')
const fs = require('fs')
const path = require('path')

/**
 * Pipeline runner:
 */

const stream = require('stream')
const util = require('util')
const pipeline = util.promisify(stream.pipeline)


const main = async () => {
  const inputPath = path.resolve(__dirname,
    '../../../../fixtures/urls')
  const outputPath = path.resolve(__dirname,
    '../../../../fixtures/output/urls-ok')

  /**
   * If the output file exists already then remove it, to make for
   * a better test:
   */

  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath)
  }

  /**
   * Prepare a pipeline:
   */

  const source = fs.createReadStream(inputPath)
  const split = new class extends stream.Transform {
    _transform(chunk, encoding, callback) {
      chunk.toString().split('\n').forEach(line => this.push(line))
      callback()
    }
  }
  const request = new class extends stream.Transform {
    async _transform(url, encoding, callback) {
      const res = await fetch(url)
      const ret = await res.text()
      this.push(ret)
      callback()
    }
  }
  const sink = fs.createWriteStream(outputPath)

  /**
   * Run the pipeline:
   */

  await pipeline(
    source,
    split,
    request,
    sink
  )

  /**
   * Check that the output file was written correctly:
   */

  const stat = fs.statSync(outputPath)
  tap.same(stat.size, 1559)
}

tap.resolves(main())
