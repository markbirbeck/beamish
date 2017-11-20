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
        const mysql = require('mysql');

        const connectionConfiguration = this.source.spec.connectionConfiguration;
        const query = this.source.spec.query;

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
          if (!this.status) {
            this.status = 'initialised';
            this.p.resolve(this.advance());
          }
        })
        .on('error', (err) => {
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
        this.current = this.stream.read(1);

        return Promise.resolve(!!this.current);
      }

      getCurrent() {
        return this.current;
      }

      close() {
        if (this.status === 'initialised') {
          this.status = 'closing';
          this.connection.end(err => {
            this.status = null;
            if (err) {
              throw new Error('Error closing MySQL connection:', err);
            }
          });
        }
      }
    };
  }
};

module.exports = MySqlSource;
