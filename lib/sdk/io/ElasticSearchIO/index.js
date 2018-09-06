/**
 * https://github.com/apache/beam/blob/master/sdks/java/io/elasticsearch/src/main/java/org/apache/beam/sdk/io/elasticsearch/ElasticsearchIO.java
 */

const { checkArgument, checkState } = require('../../util/Preconditions')

class Write {
  constructor(builder) {
    this.connectionConfiguration = builder.connectionConfiguration
    this.maxBatchSize = builder.maxBatchSize
    this.maxBatchSizeBytes = builder.maxBatchSizeBytes
    this.usePartialUpdate = builder.usePartialUpdate
  }

  /**
   * The builder lets us create a mutable object which we can convert to an
   * immutable Write object with build():
   */

  static get Builder() {
    return class Builder {
      constructor(builder) {
        if (builder) {
          this.connectionConfiguration = builder.connectionConfiguration
          this.maxBatchSize = builder.maxBatchSize
          this.maxBatchSizeBytes = builder.maxBatchSizeBytes
          this.usePartialUpdate = builder.usePartialUpdate
        }
      }

      setConnectionConfiguration(connectionConfiguration) {
        this.connectionConfiguration = connectionConfiguration
        return this
      }

      setMaxBatchSize(maxBatchSize) {
        this.maxBatchSize = maxBatchSize
        return this
      }

      setMaxBatchSizeBytes(maxBatchSizeBytes) {
        this.maxBatchSizeBytes = maxBatchSizeBytes
        return this
      }

      setUsePartialUpdate(usePartialUpdate) {
        this.usePartialUpdate = usePartialUpdate
        return this
      }

      build() {
        return new Write(this)
      }
    }
  }

  /**
   * This duplicates an existing Write object as a builder so that more properties
   * can be added:
   */

  builder() {
    return new Write.Builder(this)
  }

  /**
    * Provide the Elasticsearch connection configuration object.
    *
    * @param connectionConfiguration the ElasticSearch {@link ConnectionConfiguration} object
    * @return the {@link Write} with connection configuration set
    */

  withConnectionConfiguration(connectionConfiguration) {
    checkArgument(connectionConfiguration !== null,
      'connectionConfiguration can not be null')
    return this.builder()
    .setConnectionConfiguration(connectionConfiguration)
    .build()
  }

  /**
   * expand() is called in the pipeline building phase and replaces a node
   * in the graph with something more complex:
   */

  expand() {

    /**
     * TODO(MB): This should take a 'PCollection input' parameter, and then
     * call input.apply(). I.e.,
     *
     *  expand(input) {
     *    input.apply(ParDo.of(new WriteFn(this)))
     *    return PDone.in(input.getPipeline())
     *  }
     */

    checkState(this.connectionConfiguration !== null,
      'withConnectionConfiguration() is required')
    const WriteFn = require('./WriteFn')
    return new WriteFn(this)
  }
}

class ElasticSearchIO {
  /**
   * write() returns a Write object, configured with default properties:
   */

  static write() {
    return new Write.Builder()
    // advised default starting batch size in ES docs
    .setMaxBatchSize(1000)
    // advised default starting batch size in ES docs
    .setMaxBatchSizeBytes(5 * 1024 * 1024)
    // default is document upsert
    .setUsePartialUpdate(false)
    .build()
  }
}

/**
 * Make the configuration class available in this namespace:
 */

ElasticSearchIO.ConnectionConfiguration = require('./ConnectionConfiguration')

module.exports = ElasticSearchIO
