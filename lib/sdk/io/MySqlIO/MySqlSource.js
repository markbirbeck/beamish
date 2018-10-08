const debug = require('debug')('MySqlSource:MySqlReader')
const BoundedSource = require('./../BoundedSource');

class MySqlSource extends BoundedSource {
  constructor(spec) {
    super();
    this.spec = spec;
  }

  createReader(/*PipelineOptions options*/) {
    return new MySqlSource.MySqlReader(this);
  }

  static get MySqlReader() {
    return class MySqlReader extends BoundedSource.BoundedReader {
      start() {
        debug('Starting reader')
        const mysql = require('mysql');

        const source = this.getCurrentSource()
        const connectionConfiguration = source.spec.connectionConfiguration;
        const query = source.spec.query;
        const nestTables = source.spec.nestTables

        debug(`Connecting to stream: ${
          JSON.stringify({
            ...connectionConfiguration,
            password: '*****'
          })
        }`)
        debug(`Creating stream with query: ${query}`)
        this.connection = mysql.createConnection(connectionConfiguration);

        this.list = []

        /**
         * Flag to track whether we've prepared the stream for the
         * available() method:
         */

        this.preparedAvailable = false;

        this.stream = this.connection
        .query({
          sql: query,
          nestTables
        })
        .stream()
        ;

        this.status = null;
        this.stream
        .on('readable', () => {
          debug('Stream fired readable event')

          /**
           * Remove all event listeners now that the stream is
           * established, because we're going to attach new ones:
           */

          this.stream.removeAllListeners('readable');
          this.stream.removeAllListeners('error');

          /**
           * On the first time through, indicate that we're initialised
           * and kick everything off with a call to advance():
           */

          this.status = 'initialised';
          this.p.resolve(this.advance());
        })
        .on('error', (err) => {
          debug(`Stream fired error event: ${err}`)
          this.status = 'error';
          console.error(`Error connecting to MySQL: ${err}`);
          this.p.reject(err);
        })
        ;

        /**
         * Return a promise that will have its resolve and reject behaviour
         * implemented by the stream events above:
         */

        return new Promise((resolve, reject) => {
          this.p = { resolve, reject };
        });
      }

      async advance() {
        debug('Advancing stream')
        if (!this.status) {
          throw new Error('Trying to advance before initialised or after closed');
        }
        this.current = await this.read();
        debug(`Current is now ${JSON.stringify(this.current)}`)
        return (this.current !== null) ? true : false;
      }

      async read() {

        /**
         * We should have a buffer of records that we've already processed, but
         * if not, grab some more:
         */

        if (!this.list.length) {
          const buffer = await this.readFromStream()

          /**
           * Getting back null means we're all finished:
           */

          if (buffer === null) return null

          this.list.push(buffer)
        }
        return this.list.shift();
      }

      async readFromStream() {

        /**
         * Read from the stream, and if we get anything back, return it:
         */

        const buffer = this.stream.read(1);
        if (buffer !== null) return buffer;

        /**
         * If no data was returned then see if we're finished:
         */

        const available = await this.available();

        /**
         * If there's no data available then it means we're finished:
         */

        if (!available) return null;

        /**
         * If there is data available then call read again, to read it:
         */

        return this.readFromStream();
      }

      /**
       * TODO(MB): The model for this could be async generators, which would
       * make it quite neat:
       */

      available() {
        /**
         * To read data we register handlers for the data events:
         */

        if (!this.preparedAvailable) {
          this.preparedAvailable = true;
          this.stream
          .on('readable', () => {
            this.p2.resolve(true);
          })
          .on('end', () => {
            this.p2.resolve(false);
          })
          .on('error', err => {
            console.error(`Error waiting for more data: ${err}`);
            this.p2.reject(err);
          })
          ;
        }

        return new Promise((resolve, reject) => {
          this.p2 = {resolve, reject};
        });
      }

      getCurrent() {
        debug(`Returning request for current: ${JSON.stringify(this.current)}`)
        return this.current;
      }

      close() {
        debug('Starting to close stream')
        if (this.status === 'initialised') {
          this.status = 'closing';
          debug('Waiting for connection to close')
          this.connection.end(err => {
            this.status = null;
            if (err) {
              throw new Error('Error closing MySQL connection:', err);
            } else {
              debug('Connection has now closed')
            }
          });
        } else {
          debug('Tried to close a stream that was not initialised')
        }
      }
    };
  }
};

module.exports = MySqlSource;
