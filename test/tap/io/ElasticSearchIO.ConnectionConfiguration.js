const tap = require('tap')

const ConnectionConfiguration = require('../../../lib/sdk/io/ElasticSearchIO/ConnectionConfiguration')

tap.comment('Check that all values are set correctly.')
let config = ConnectionConfiguration.create('http://host:9200', 'my-index', 'my-type')

tap.equal(config.addresses, 'http://host:9200')
tap.equal(config.index, 'my-index')
tap.equal(config.type, 'my-type')
tap.equal(config.requestTimeout, undefined)

tap.comment('Check that values are readonly')
config.index = 'a-new-index-that-should-be-ignored'
tap.equal(config.index, 'my-index')

tap.comment('Check that errors are thrown if arguments are incorrect.')
tap.throws(
  () => ConnectionConfiguration.create('http://host:9200', 'my-index'),
  { message: 'type can not be undefined' }
)
tap.throws(
  () => ConnectionConfiguration.create('http://host:9200'),
  { message: 'index can not be undefined' }
)
tap.throws(
  () => ConnectionConfiguration.create(),
  { message: 'addresses can not be undefined' }
)

tap.comment('Check requestTimeout (it\'s optional)')
config = ConnectionConfiguration.create('http://host:9200', 'my-index', 'my-type', 10000)

tap.equal(config.addresses, 'http://host:9200')
tap.equal(config.index, 'my-index')
tap.equal(config.type, 'my-type')
tap.equal(config.requestTimeout, 10000)
