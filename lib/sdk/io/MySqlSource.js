const BoundedSource = require('./BoundedSource');

class MySqlReader extends BoundedSource.BoundedReader {
  start() {
    const mysql = require('mysql');

    this.connection = mysql.createConnection({
      host     : 'db',
      user     : 'root',
      password : 'college',
      database : 'employees'
    });

    this.stream = this.connection
    .query('SELECT dept_name FROM departments;')
    .stream()
    ;

    /**
     * The first time we get the 'readable' event, resolve any waiting
     * processes with the results of performing an advance:
     */

    this.initialised = false;
    this.stream
    .on('readable', () => {
      if (!this.initialised) {
        this.initialised = true;
        this.p.resolve(this.advance());
      }
    })
    .on('error', (err) => {
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

  getCurrentTimestamp() {
    throw new Error('getCurrent() not implemented');
  }

  close() {
    this.connection.end(err => {
      if (err) {
        throw new Error('Error closing MySQL connection:', err);
      }
    });
  }
};

class MySqlSource extends BoundedSource {
  createReader(/*PipelineOptions options*/) {
    return new MySqlReader();
  }

  static get MySqlReader() { return MySqlReader; }
};

module.exports = MySqlSource;
