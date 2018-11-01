const tap = require('tap')

const stream = require('stream')
const fs = require('fs')
const util = require('util')
const zlib = require('zlib')

const pipeline = util.promisify(stream.pipeline)

async function main() {
  const source = fs.createReadStream('../../../fixtures/shakespeare/1kinghenryiv')
  const transform = zlib.createGzip()
  const sink = fs.createWriteStream('../../../fixtures/output/1kinghenryiv.gz')

  try {
    await pipeline(
      source,
      transform,
      sink
    )

    console.log('Pipeline succeeded')

    const stat = fs.statSync('../../../fixtures/output/1kinghenryiv.gz')
    tap.same(stat.size, 57801)
  } catch (err) {
    console.error('Pipeline failed', err)
  }
}

main()
