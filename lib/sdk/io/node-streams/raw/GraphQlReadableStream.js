const debug = require('debug')('GraphQlReadableStream')
const stream = require('stream')

const { ApolloClient } = require('apollo-client')
const { InMemoryCache } = require('apollo-cache-inmemory')
const { HttpLink } = require('apollo-link-http')
const fetch = require('node-fetch')

/**
 * A GraphQL client preconfigured with:
 *
 * - an in-memory cache;
 * - the 'node-fetch' module.
 */
class ApiClient extends ApolloClient {
  constructor(uri) {
    super({
      link: new HttpLink({ uri, fetch }),
      cache: new InMemoryCache()
    })
  }
}

/**
 * A Readable stream that runs queries against GraphQL.
 */
class GraphQlReadableStream extends stream.Readable{
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
     * Create the GraphQl client:
     */
    this.client = new ApiClient(this.config.url)

    /**
     * Keep track of when procesing started and how many records
     * have been read, so that we can provide rate information:
     */
    this.started = new Date()
    this.recordsRead = 0

    /**
     * An array that will contain the results of the search.
     */
    this.records = null
    debug.extend('constructor')('done')
  }

  logRate() {
    const duration = (new Date() - this.started) / 1000
    const rate = Math.round((this.recordsRead / duration) * 100) / 100
    debug.extend('rate')(`read ${this.recordsRead} records in ${duration} (${rate} per second)`)
  }

  async _read() {
    debug.extend('_read')('reading')

    /**
     * If this is the first time through then perform the search:
     */
    if (this.records === null) {
      debug.extend('_read')(`about to search: ${JSON.stringify(this.config.query)}`)
      const res = await this.client.query({
        query: this.config.query
      })
      debug.extend('_read')(`query returned: ${JSON.stringify(res)}`)
      this.records = [res && res.data]
      debug.extend('_read')(`records: ${JSON.stringify(this.records)}`)
      this.recordsRead += this.records.length
      this.logRate()
    }

    /**
     * Once we have some search results then forward them on:
     */
    debug.extend('_read')(`starting to forward ${this.records.length} records`)
    let backpressure = false
    while (this.records.length && !backpressure) {
      backpressure = !this.push(this.records.shift())
    }
    if (backpressure) {
      debug.extend('_read')(`backpressure with ${this.records.length} records remaining`)
    } else {
      this.push(null)
      debug.extend('_read')('finished forwarding records')
    }
  }
}

module.exports = GraphQlReadableStream
