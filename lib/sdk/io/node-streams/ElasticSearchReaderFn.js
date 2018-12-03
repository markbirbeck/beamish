const DoFn = require('./../../harnesses/node-streams/DoFn')

/**
 * A DoFn that reads from ElasticSearch.
 */
class ElasticSearchReaderFn extends DoFn {
  constructor(config) {
    super()
    this.config = config
  }

  setup() {
    const ElasticSearchReadableStream = require('./raw/ElasticSearchReadableStream')
    this.stream = new ElasticSearchReadableStream(this.config)
  }

  finishBundle() {
    this.stream.destroy()
  }
}

module.exports = ElasticSearchReaderFn
