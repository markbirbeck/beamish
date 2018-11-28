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
        const fetch = require('node-fetch');
        const url = this.source.spec.url;

        this.connection = fetch(url);
        this.status = null;

        this.connection
        .then(res => {
          if (!res.ok) {
            const err = `Error connecting to URL: (${res.status})`;
            console.error(err);
            this.p.reject(new Error(err));
          }

          this.status = 'initialised';
          this.res = res;

          /**
           * Resolve any waiting processes with the results of performing an
           * advance:
           */

          this.p.resolve(this.advance());
        })
        .catch(err => {
          this.status = 'error';
          console.error(`Error connecting to URL: ${err}`);
          this.p.reject(err);
        });

        /**
         * Return a promise that will have its resolve and reject behaviour
         * implemented by the stream events above:
         */

        return new Promise((resolve, reject) => {
          this.p = { resolve, reject };
        });
      }

      async advance() {

        /**
         * If the response hasn't been read yet then get it:
         */

        if (!this.res.bodyUsed) {
          const ct = this.res.headers.get('Content-Type');

          /**
           * TODO(MB): A lot more could be done here since there are lots
           * more mime types we need to take account of:
           */

          if (ct.indexOf('application/json') === 0) {
            this.current = await this.res.json();
          } else if (ct.indexOf('text/') === 0 || ct.indexOf('application/') === 0) {
            this.current = await this.res.text();
          } else {
            throw new Error(`Unrecognised type: '${ct}'`);
          }
        } else {
          this.current = null;
        }

        return !!this.current;
      }

      getCurrent() {
        return this.current;
      }

      close() {
        if (this.status === 'initialised') {
          this.status = null;
        } else {
          throw new Error('Trying to close an uninitialised RequestSource');
        }
      }
    };
  }
};

module.exports = RequestSource;
