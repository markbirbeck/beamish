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

        this.stream = fs.createReadStream(filepattern, 'utf8');
        this.status = null;
        this.stream
        .on('open', () => {

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
        return this.readFromStream();
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

      available() {
        return new Promise((resolve, reject) => {
          this.stream
          .on('readable', () => {
            resolve(true);
          })
          .on('end', () => {
            resolve(false);
          })
          .on('error', (err) => {
            console.error(`Error waiting for more data: ${err}`);
            reject(err);
          })
          ;
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
