/**
 * This is a reference pipeline which shows how a simple pipeline works
 * using only Node streams:
 */

const tap = require('tap')

/**
 * For input, output and transform streams:
 */

const fs = require('fs')
const zlib = require('zlib')

/**
 * Pipeline runner:
 */

const stream = require('stream')
const util = require('util')
const pipeline = util.promisify(stream.pipeline)


async function main() {
  const inputPath = '../../fixtures/shakespeare/1kinghenryiv'
  const outputPath = '../../fixtures/output/1kinghenryiv-raw.tar.gz'

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
  const transform = zlib.createGzip()
  const sink = fs.createWriteStream(outputPath)

  /**
   * Run the pipeline:
   */

  await pipeline(
    source,
    transform,
    sink
  )

  /**
   * Check that the output file was written correctly:
   */

  const stat = fs.statSync(outputPath)
  tap.same(stat.size, 57801)
}

tap.resolves(main())
