const { checkArgument } = require('../../util/Preconditions')
const Serializable = require('../Serializable');

class DataSourceConfiguration extends Serializable {
  constructor(builder) {
    super()
    if (builder) {
      this.username = builder.username
      this.password = builder.password
      this.connectionProperties = builder.connectionProperties
      this.dataSource = builder.dataSource
    }
  }

  toJSON() {
    return {
      username: this.username,
      password: this.password,
      connectionProperties: this.connectionProperties,
      dataSource: this.dataSource
    }
  }

  withUsername(username) {
    return this.builder()
    .setUsername(username)
    .build()
  }

  withPassword(password) {
    return this.builder()
    .setPassword(password)
    .build()
  }

  /**
   * Sets the connection properties passed to driver.connect(...). Format of the string must be
   * [propertyName=property;]*
   *
   * <p>NOTE - The "user" and "password" properties can be add via {@link #withUsername(String)},
   * {@link #withPassword(String)}, so they do not need to be included here.
   */

  withConnectionProperties(connectionProperties) {
    checkArgument(connectionProperties, 'connectionProperties can not be null')

    return this.builder()
    .setConnectionProperties(connectionProperties)
    .build()
  }

  buildDataSource() {
    const MySqlDataSource = require('../io/MySqlIO/MySqlDataSource')

    const dataSource = new MySqlDataSource(this)
    return dataSource
  }

  builder() {
    return new Builder(this)
  }
}

class Builder {
  constructor(builder) {
    if (builder) {
      this.username = builder.username
      this.password = builder.password
      this.connectionProperties = builder.connectionProperties
      this.dataSource = builder.dataSource
    }
  }

  setUsername(username) {
    this.username = username
    return this
  }

  setPassword(password) {
    this.password = password
    return this
  }

  setConnectionProperties(connectionProperties) {
    this.connectionProperties = connectionProperties
    return this
  }

  setDataSource(dataSource) {
    this.dataSource = dataSource
    return this
  }

  build() {
    return new DataSourceConfiguration(this)
  }
}

exports.create = (dataSource) => {
  checkArgument(dataSource, 'dataSource can not be undefined')

  return new Builder()
  .setDataSource(dataSource)
  .build()
}
