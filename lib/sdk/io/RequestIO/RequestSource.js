
const BoundedSource = require('../BoundedSource');

class RequestSource extends BoundedSource {
  constructor(spec) {
    super();
    this.spec = spec;
  }

  createReader(/*PipelineOptions options*/) {
    return new RequestSource.RequestReader(this);
  }

  static get RequestReader() {
    return class RequestReader extends BoundedSource.BoundedReader {
      start() {
        const request = require('https');
        const url = this.source.spec.url;

        this.connection = request.get(url);

        this.status = null;

        this.connection
        .on('response', res => {
          if (res.statusCode !== 200) {
            const err = `Error connecting to URL: ${res.statusCode}`;
            console.error(err);
            this.p.reject(new Error(err));
          }

          /**
           * The first time we get the 'readable' event, resolve any waiting
           * processes with the results of performing an advance:
           */

          this.stream = res;
          this.stream
          .on('readable', () => {
            if (!this.status) {
              this.status = 'initialised';
              this.p.resolve(this.advance());
            }
          })
          .on('error', (err) => {
            this.status = 'error';
            console.error(`Error connecting to URL: ${err}`);
            this.p.reject(err);
          })
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
        this.current = JSON.parse(this.stream.read());

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
              throw new Error('Error closing URL connection:', err);
            }
          });
        }
      }
    };
  }
};

module.exports = RequestSource;
