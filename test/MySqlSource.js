const chai = require('chai');

chai.should();

const MySqlSource = require('../lib/sdk/io/MySqlSource');

describe('MySqlSource', () => {
  it('createReader()', (done) => {
    let reader = new MySqlSource().createReader();

    try {
      let f = async () => {

        /**
         * start() should make the first item available:
         */

        let available = await reader.start();

        available.should.be.true;
        reader.getCurrent().dept_name.should.eql('Customer Service');

        /**
         * Advance should make the next item available:
         */

        available = await reader.advance();
        available.should.be.true;
        reader.getCurrent().dept_name.should.eql('Development');
      }
      f();
    } finally {
      reader.close();
      done();
    }
  });
});
