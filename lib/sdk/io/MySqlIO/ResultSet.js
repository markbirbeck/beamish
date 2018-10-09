const debug = require('debug')('MySqlIO:ResultSet')

class ResultSet {
  constructor(connection, query, nestTables) {
    this.stream = connection
    .query({
      sql: query,
      nestTables
    })
    .stream()
    this.reader = new MySqlReader(connection)
    this.started = false
  }

  async next() {
    let available

    if (!this.started) {
      available = await this.reader.start(this.stream)
      this.started = true
    } else {
      available = await this.reader.advance(this.stream)
    }
    return available
  }

  getCurrent() {
    return this.reader.getCurrent()
  }
}

class MySqlReader {
  constructor(connection) {
    this.connection = connection
  }

  start(stream) {
    debug('Starting reader')

    this.list = []

    /**
     * Flag to track whether we've prepared the stream for the
     * available() method:
     */

    this.preparedAvailable = false

    this.status = null
    stream
    .on('readable', () => {
      debug('Stream fired readable event')

      /**
       * Remove all event listeners now that the stream is
       * established, because we're going to attach new ones:
       */

      stream.removeAllListeners('readable')
      stream.removeAllListeners('error')

      /**
       * On the first time through, indicate that we're initialised
       * and kick everything off with a call to advance():
       */

      this.status = 'initialised'
      this.p.resolve(this.advance(stream))
    })
    .on('error', (err) => {
      debug(`Stream fired error event: ${err}`)
      this.status = 'error'
      console.error(`Error connecting to MySQL: ${err}`)
      this.p.reject(err)
    })

    /**
     * Return a promise that will have its resolve and reject behaviour
     * implemented by the stream events above:
     */

    return new Promise((resolve, reject) => {
      this.p = { resolve, reject }
    })
  }

  async advance(stream) {
    // debug('Advancing stream')
    if (!this.status) {
      throw new Error('Trying to advance before initialised or after closed')
    }
    this.current = await this.read(stream)
    // debug(`Current is now ${JSON.stringify(this.current)}`)
    return (this.current !== null) ? true : false
  }

  async read(stream) {

    /**
     * We should have a buffer of records that we've already processed, but
     * if not, grab some more:
     */

    if (!this.list.length) {
      const buffer = await this.readFromStream(stream)

      /**
       * Getting back null means we're all finished:
       */

      if (buffer === null) return null

      this.list.push(buffer)
    }
    return this.list.shift()
  }

  async readFromStream(stream) {

    /**
     * Read from the stream, and if we get anything back, return it:
     */

    const buffer = stream.read(1)
    if (buffer !== null) return buffer

    /**
     * If no data was returned then see if we're finished:
     */

    const available = await this.available(stream)

    /**
     * If there's no data available then it means we're finished:
     */

    if (!available) return null

    /**
     * If there is data available then call read again, to read it:
     */

    return this.readFromStream(stream)
  }

  /**
   * TODO(MB): The model for this could be async generators, which would
   * make it quite neat:
   */

  available(stream) {
    /**
     * To read data we register handlers for the data events:
     */

    if (!this.preparedAvailable) {
      this.preparedAvailable = true
      stream
      .on('readable', () => {
        this.p2.resolve(true)
      })
      .on('end', () => {
        this.p2.resolve(false)
      })
      .on('error', err => {
        console.error(`Error waiting for more data: ${err}`)
        this.p2.reject(err)
      })
    }

    return new Promise((resolve, reject) => {
      this.p2 = {resolve, reject}
    })
  }

  getCurrent() {
    return this.current
  }

  async close() {
    debug('Starting to close stream')
    if (this.status === 'initialised') {
      this.status = 'closing'
      debug('Waiting for connection to close')
      await this.connection.close()
      this.status = null
    } else {
      debug('Tried to close a stream that was not initialised')
    }
  }
}

module.exports = ResultSet
