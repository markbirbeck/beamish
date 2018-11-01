const tap = require('tap')

const stream = require('stream')
const fs = require('fs')
const util = require('util')
const zlib = require('zlib')

const pipeline = util.promisify(stream.pipeline)

class IdentityTransform extends stream.Transform {
  _transform(chunk, encoding, callback) {
    this.push(chunk)
    callback()
  }
}

async function main() {
  const source = fs.createReadStream('../../../fixtures/shakespeare/1kinghenryiv')
  const transform = new IdentityTransform()
  const sink = fs.createWriteStream('../../../fixtures/output/1kinghenryiv')

  try {
    await pipeline(
      source,
      transform,
      sink
    )

    console.log('Pipeline succeeded')

    const stat = fs.statSync('../../../fixtures/output/1kinghenryiv')
    tap.same(stat.size, 145002)
  } catch (err) {
    console.error('Pipeline failed', err)
  }
}

main()
