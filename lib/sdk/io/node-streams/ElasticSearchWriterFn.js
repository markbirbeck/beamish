const DoFn = require('./../../harnesses/node-streams/DoFn')

class ElasticSearchWriterFn extends DoFn {
  constructor(config) {
    super()
    this.config = config
  }

  setup() {
    const ElasticSearchWritableStream = require('./raw/ElasticSearchWritableStream')
    this.stream = new ElasticSearchWritableStream(this.config,
      { highWaterMark: 1000 })
  }

  finishBundle() {
    this.stream.destroy()
  }
}

module.exports = ElasticSearchWriterFn
