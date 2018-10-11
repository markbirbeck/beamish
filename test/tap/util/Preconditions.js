const tap = require('tap')

const { checkArgument, checkState } = require('../../../lib/sdk/util/Preconditions')

tap.comment('Check that the assertions are the right way around.')
tap.doesNotThrow(() => checkArgument('foo' !== null))
tap.throws(() => checkArgument('blah' === null))
tap.doesNotThrow(() => checkState('foo' !== null))
tap.throws(() => checkState('blah' === null))

tap.comment('Check that the messages are reported.')
tap.throws(() => checkArgument('blah' === null, 'blah must be null'),
  { message: 'blah must be null' })
tap.throws(() => checkState('blah' === null, 'blah must be null'),
  { message: 'blah must be null' })

tap.comment('Check that the error type is reported.')
tap.throws(() => checkArgument('blibble' === null, 'blibble must be null'),
  { message: 'blibble must be null', name: 'IllegalArgumentError' })
tap.throws(() => checkState('blibble' === null, 'blibble must be null'),
  { message: 'blibble must be null', name: 'IllegalStateError' })
