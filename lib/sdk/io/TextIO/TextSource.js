/**
 * https://github.com/apache/beam/blob/master/sdks/java/core/src/main/java/org/apache/beam/sdk/io/TextIO.java
 */

const BoundedSource = require('../BoundedSource');

class TextSource extends BoundedSource {
  constructor(spec) {
    super();
    this.spec = spec;
  }

  createReader(/*PipelineOptions options*/) {
    return new TextSource.TextReader(this);
  }

  static get TextReader() {
    return class TextReader extends BoundedSource.BoundedReader {
      start() {
        const fs = require('fs');
        const source = this.getCurrentSource();
        const filepattern = source.spec.filepattern;

        this.last = '';
        this.list = [];

        /**
         * Flag to track whether we've prepared the stream for the
         * available() method:
         */

        this.preparedAvailable = false;

        this.stream = fs.createReadStream(filepattern, 'utf8');
        this.status = null;
        this.stream
        .on('open', () => {
          /**
           * Remove all event listeners now that the stream is
           * established, because we're going to attach new ones:
           */

          this.stream.removeAllListeners('open');
          this.stream.removeAllListeners('error');

          /**
           * On the first time through, indicate that we're initialised
           * and kick everything off with a call to advance():
           */

          this.status = 'initialised';
          this.p.resolve(this.advance());
        })
        .on('error', (err) => {
          this.status = 'error';
          console.error(`Error connecting to file: ${err}`);
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
        if (!this.status) {
          throw new Error('Trying to advance before initialised or after closed');
        }
        this.current = await this.read();
        return (this.current !== null) ? true : false;
      }

      async read() {

        /**
         * We should have a buffer of lines that we've already processed, but
         * if not, grab some more:
         */

        if (!this.list.length) {
          const buffer = await this.readFromStream();

          /**
           * Getting back null means we're all finished:
           */

          if (buffer === null) return null;

          /**
           * Add any leftovers from previous processing to the front of
           * the new data:
           */

          this.last += buffer;

          /**
           * Split the data; we're looking for '\r', '\n', or '\r\n':
           */

          this.list = this.last.split(/\r\n|[\r\n]/);

          /**
           * Save the very last entry for next time, since we don't know
           * whether it's a full line or not:
           */

          this.last = this.list.pop();
        }
        return this.list.shift();
      }

      async readFromStream() {

        /**
         * Read from the stream, and if we get anything back, return it:
         */

        const buffer = this.stream.read();
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
        return this.current;
      }

      close() {
        if (!this.status) {
          throw new Error('Trying to close before initialised or after closed');
        }
        this.status = null;
      }
    }
  }
}

module.exports = TextSource;
