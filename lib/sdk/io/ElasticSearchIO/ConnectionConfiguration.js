const Serializable = require('../Serializable');

const hidden = new WeakMap()

class ConnectionConfiguration extends Serializable {
  constructor(builder) {
    super()
    hidden.set(this, new Map(builder))
  }

  get addresses() {
    return hidden.get(this).get('addresses')
  }

  get index() {
    return hidden.get(this).get('index')
  }

  get type() {
    return hidden.get(this).get('type')
  }

  static get Builder() {
    return class Builder {
      setAddresses(addresses) {
        this.addresses = addresses
        return this
      }

      setIndex(index) {
        this.index = index
        return this
      }

      setType(type) {
        this.type = type
        return this
      }

      build() {
        return new ConnectionConfiguration(Object.entries(this))
      }
    }
  }
}

class _ConnectionConfiguration {
  static create(addresses, index, type) {
    checkArgument(addresses, 'addresses can not be undefined')
    checkArgument(index, 'index can not be undefined')
    checkArgument(type, 'type can not be undefined')

    const connectionConfiguration = new ConnectionConfiguration.Builder()
    .setAddresses(addresses)
    .setIndex(index)
    .setType(type)
    .build()

    return connectionConfiguration
  }
}

module.exports = _ConnectionConfiguration
