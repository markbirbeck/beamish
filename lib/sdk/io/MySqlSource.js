const debug = require('debug')('MySqlSource:MySqlReader')
const BoundedSource = require('./BoundedSource');

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

        debug(`Connecting to stream: ${
          JSON.stringify({
            ...connectionConfiguration,
            password: '*****'
          })
        }`)
        debug(`Creating stream with query: ${query}`)
        this.connection = mysql.createConnection(connectionConfiguration);
        this.stream = this.connection
        .query(query)
        .stream()
        ;

        /**
         * The first time we get the 'readable' event, resolve any waiting
         * processes with the results of performing an advance:
         */

        this.status = null;
        this.stream
        .on('readable', () => {
          debug('Stream fired readable event')
          if (!this.status) {
            debug('Stream is now initialised')
            this.status = 'initialised';
            this.p.resolve(this.advance());
          }
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

      advance() {
        debug('Advancing stream')
        this.current = this.stream.read(1);
        debug(`Current is now ${JSON.stringify(this.current)}`)

        return Promise.resolve(!!this.current);
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
