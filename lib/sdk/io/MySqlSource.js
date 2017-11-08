const BoundedSource = require('./BoundedSource');
const MySqlReader = require('./MySqlReader');

class MySqlSource extends BoundedSource {
  createReader(/*PipelineOptions options*/) {
    return new MySqlReader();
  }
};

module.exports = MySqlSource;
