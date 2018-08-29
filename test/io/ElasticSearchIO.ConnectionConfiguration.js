const tap = require('tap')

const ConnectionConfiguration = require('../../lib/sdk/io/ElasticSearchIO/ConnectionConfiguration')

tap.comment('Check that all values are set correctly.')
const config = ConnectionConfiguration.create('http://host:9200', 'my-index', 'my-type')

tap.equal(config.addresses, 'http://host:9200')
tap.equal(config.index, 'my-index')
tap.equal(config.type, 'my-type')
