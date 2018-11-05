const DoFn = require('./../../harnesses/node-streams/DoFn')

class ElasticSearchWriterFn extends DoFn {
  constructor(config) {
    super()
    this.config = config

    /**
     * Set an objectMode flag so that DoFnAsWritable can set itself up
     * correctly:
     */

    this.objectMode = true
  }

  setup() {
    const ElasticSearchWritableStream = require('./ElasticSearchWritableStream')
    this.stream = new ElasticSearchWritableStream(this.config,
      { highWaterMark: 1000 })
  }

  teardown() {
    this.stream.destroy()
  }
}

module.exports = ElasticSearchWriterFn
