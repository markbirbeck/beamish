/**
 * This modifies the reference pipeline slightly, with a runner:
 */

const tap = require('tap')

/**
 * For input, output and transform streams:
 */

const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

/**
 * Pipeline runner:
 */

class Runner {
  constructor() {
    const stream = require('stream')
    const util = require('util')
    this.pipeline = util.promisify(stream.pipeline)
  }

  run(...streams) {
    return this.pipeline(...streams)
  }
}

const main = async () => {
  const inputPath = path.resolve(__dirname,
    '../../fixtures/shakespeare/1kinghenryiv')
  const outputPath = path.resolve(__dirname,
    '../../fixtures/output/1kinghenryiv-raw-runner.tar.gz')

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

  const runner = new Runner()
  await runner.run(
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
