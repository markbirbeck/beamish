/**
 * Implement requests as a transform, using only Node streams:
 */

const tap = require('tap')

/**
 * For input, output and transform streams:
 */

const ChildProcess = require('duplex-child-process')
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
    '../../../../fixtures/file2.txt')
  const outputPath = path.resolve(__dirname,
    '../../../../fixtures/output/spawn-raw')

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
  const spawn = new ChildProcess.spawn('tr', ['[a-z]', '[A-Z]'])
  const sink = fs.createWriteStream(outputPath)

  /**
   * Run the pipeline:
   */

  await pipeline(
    source,
    spawn,
    sink
  )

  /**
   * Check that the output file was written correctly:
   */

  const stat = fs.statSync(outputPath)
  tap.same(stat.size, 43)
}

tap.resolves(main())
