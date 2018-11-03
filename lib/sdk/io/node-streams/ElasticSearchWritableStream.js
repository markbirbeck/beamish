const debug = require('debug')('ElasticSearchWritableStream')
const stream = require('stream')
const elasticsearch = require('elasticsearch')

class ElasticSearchWritableStream extends stream.Writable{
  constructor(config, options) {
    /**
     * We're dealing with objects because we need to extract things like an
     * ID from the record. But all other options can be set by the caller:
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

    this.started = new Date()
    this.written = 0
    debug.extend('constructor')('done')
  }

  idFn(obj) {
    let id

    if (this.config && this.config.idFn) {
      id = this.config.idFn(obj)
      if (id === undefined) {
        throw new Error(`There is no ID for object ${JSON.stringify(obj)}`)
      }
    }
    return id
  }

  logRate() {
    const duration = (new Date() - this.started) / 1000
    const rate = Math.round((this.written / duration) * 100) / 100
    debug.extend('rate')(`written ${this.written} records in ${duration} (${rate} per second)`)
  }

  async _destroy() {
    await this.client.close()
    debug.extend('_destroy')('done')
  }

  /**
   * When writing a single record, we use the index() method of the ES API:
   */

  async _write(body, enc, next) {
    debug.extend('_write')('writing 1 record')

    /**
     * Push the object to ES and indicate that we are ready for the next one.
     * Be sure to propagate any errors:
     */

    try {
      await this.client.index({
        index: this.config.index,
        type: this.config.type,
        id: this.idFn(body),
        body
      })
      this.written++
      this.logRate()
      next()
    } catch(err) {
      next(err)
    }
  }

  /**
   * When writing a bunch of records we can use the bulk() method of the ES API:
   */

  async _writev(chunks, next) {
    const body = chunks
    .map(chunk => chunk.chunk)
    .reduce((arr, obj) => {
      arr.push({ index: { _id: this.idFn(obj) } })
      arr.push(obj)
      return arr
    }, [])
    debug.extend('_writev')(`writing ${chunks.length} records`)

    /**
     * Push the array of actions to ES and indicate that we are ready for the next
     * one. Be sure to propagate any errors:
     */

    try {
      await this.client.bulk({
        index: this.config.index,
        type: this.config.type,
        body
      })
      this.written += chunks.length
      this.logRate()
      next()
    } catch(err) {
      next(err)
    }
  }
}

module.exports = ElasticSearchWritableStream
