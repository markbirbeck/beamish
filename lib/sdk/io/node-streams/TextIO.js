const FileReaderFn = require('./FileReaderFn')
const ParDo = require('./../../harnesses/node-streams/ParDo')

exports.read = () => ({
  from: path => ParDo.of(new FileReaderFn(path))
})
