/**
 * [TODO] In the Java version of Beam this is 'Source', rather than
 * 'Source.Source', as we have here:
 */

const { Source } = require('./Source');

class BoundedSource extends Source { }

module.exports = BoundedSource;
