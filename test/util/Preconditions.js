const tap = require('tap')

const { checkArgument } = require('../../lib/sdk/util/Preconditions')

tap.comment('Check that the assertions are the right way around.')
tap.doesNotThrow(() => checkArgument('foo' !== null))
tap.throws(() => checkArgument('blah' === null))

tap.comment('Check that the messages are reported.')
tap.throws(() => checkArgument('blah' === null, 'blah must be null'),
  { message: 'blah must be null' })
