const debug = require('debug')('ElasticSearchReadableStream')
const stream = require('stream')
const elasticsearch = require('elasticsearch')

/**
 * A Readable stream that runs queries against ElasticSearch.
 */
class ElasticSearchReadableStream extends stream.Readable{
  constructor(config, options) {
    /**
     * Forward any options to the base class, but force objectMode
     * to be true:
     */
    super({
      ...options,
      objectMode: true
    })
    debug.extend('constructor')(`config: ${JSON.stringify(config)}`)
    debug.extend('constructor')(`options: ${JSON.stringify(options)}`)
    this.config = config

    /**
     * Create the ElasticSearch client:
     */
    this.client = new elasticsearch.Client(this.config.connection)

    /**
     * Keep track of when procesing started and how many records
     * have been read, so that we can provide rate information:
     */
    this.started = new Date()
    this.recordsRead = 0

    /**
     * An array that will contain the results of the search.
     */
    this.hits = null
    debug.extend('constructor')('done')
  }

  logRate() {
    const duration = (new Date() - this.started) / 1000
    const rate = Math.round((this.recordsRead / duration) * 100) / 100
    debug.extend('rate')(`read ${this.recordsRead} records in ${duration} (${rate} per second)`)
  }

  async _destroy() {
    await this.client.close()
    debug.extend('_destroy')('done')
  }

  async _read() {
    debug.extend('_read')('reading')

    /**
     * If this is the first time through then perform the search:
     */
    if (this.hits === null) {
      debug.extend('_read')(`about to search: ${JSON.stringify(this.config.query)}`)
      const res = await this.client.search(this.config.query)
      this.hits = (res && res.hits && res.hits.hits) || []
      this.recordsRead += this.hits.length
      this.logRate()
    }

    /**
     * Once we have some search results then forward them on:
     */
    debug.extend('_read')(`starting to forward ${this.hits.length} records`)
    let backpressure = false
    while (this.hits.length && !backpressure) {
      backpressure = !this.push(this.hits.shift()._source)
    }
    if (backpressure) {
      debug.extend('_read')(`backpressure with ${this.hits.length} records remaining`)
    } else {
      this.push(null)
      debug.extend('_read')('finished forwarding records')
    }
  }
}

module.exports = ElasticSearchReadableStream
