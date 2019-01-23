const ParDo = require('./../../harnesses/node-streams/ParDo')
const CreateReaderFn = require('./../../io/node-streams/CreateReaderFn')

exports.of = elems => ParDo.of(new CreateReaderFn(elems))
