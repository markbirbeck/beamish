const debug = require('debug')('GraphQlReadableStream')
const stream = require('stream')

const { ApolloClient } = require('apollo-client')
const { InMemoryCache } = require('apollo-cache-inmemory')
//const { ApolloLink, concat } = require('apollo-link')
const { HttpLink } = require('apollo-link-http')
const fetch = require('node-fetch')

// const { CT_CLIENT_ID, CT_CLIENT_SECRET } = process.env;
// const basicAuth = Buffer.from(''.concat(CT_CLIENT_ID, ':').concat(CT_CLIENT_SECRET)).toString('base64');
// console.log(basicAuth);

// const authMiddleware = new ApolloLink((operation, forward) => {
//   // add the authorization to the headers
//   operation.setContext({
//     headers: {
//       authorization:
//     }
//   })

//   return forward(operation)
// })

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
      // link: concat(authMiddleware, new HttpLink({ uri, fetch })),
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
     * If a path to a cursor has been provided then it means that
     * the query will have been set up to return a cursor, ready
     * for multiple reads:
     */
    if (this.config.cursorPathFn) {
      this.config.options.variables = {
        cursor: undefined
      }
    }

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
     * If we have run out of data to forward then perform the search:
     */
    if (this.records === null) {
      debug.extend('_read')(`about to search: ${JSON.stringify(this.config.options)}`)
      const res = await this.client.query(this.config.options)
      debug.extend('_read')(`query returned: ${JSON.stringify(res)}`)
      this.records = [res && res.data]
      debug.extend('_read')(`records: ${JSON.stringify(this.records)}`)
      this.recordsRead += this.records.length
      this.logRate()

      /**
       * If there is no size value set, or we haven't yet read the
       * number of requested records, then...
       */
      if (!this.config.size || (this.recordsRead < this.config.size)) {
        debug.extend('_read')(`size: ${this.config.size}`)
        debug.extend('_read')(`records read: ${this.recordsRead}`)

        /**
         * ...if a function has been specified that can grab the cursor
         * then use it. This will be used to signify that more reading
         * is needed:
         */
        if (this.config.cursorPathFn) {
          try {
            this.cursor = this.config.cursorPathFn(res.data)
          } catch(err) {
            console.error(`callback for cursorPathFn has failed: ${this.config.cursorPathFn}: ${err}`)
          }
          debug.extend('cursor')(`cursor set to: ${this.cursor}`)
        }
      } else {
        debug.extend('cursor')('clearing cursor')
        this.cursor = undefined
      }
    }

    /**
     * Once we have some search results then forward them on:
     */
    debug.extend('_read')(`starting to forward ${this.records.length} records`)
    let backpressure = false
    while (this.records.length && !backpressure) {
      backpressure = !this.push(this.records.shift())
    }
    /**
     * All the records have been forwarded so now we have to
     * decide whether we're finished or we want to do another
     * read. If the cursor was set after the last read then it
     * means that we need to repeat:
     */
    if (this.cursor && !this.records.length) {
      debug.extend('cursor')('resetting records for next time')
      this.config.options.variables.cursor = this.cursor
      this.records = null
    } else {
      /**
       * If there is backpressure then we just postpone sending
       * the end of records marker until next time we get called:
       */
      if (backpressure) {
        debug.extend('backpressure')(`backpressure with ${this.records.length} records remaining`)
      } else {
        this.push(null)
        debug.extend('_read')('finished forwarding records')
      }
    }
  }
}

module.exports = GraphQlReadableStream
