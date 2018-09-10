/**
 * https://github.com/apache/beam/blob/master/sdks/java/io/elasticsearch/src/main/java/org/apache/beam/sdk/io/elasticsearch/ElasticsearchIO.java
 */

const { checkArgument, checkState } = require('../../util/Preconditions')
const ParDo = require('../../transforms/ParDo')
const PTransform = require('../../transforms/PTransform')

class Write extends PTransform {
  constructor(builder) {
    super()
    this.connectionConfiguration = builder.connectionConfiguration
    this.idFn = builder.idFn
    this.indexFn = builder.indexFn
    this.maxBatchSize = builder.maxBatchSize
    this.maxBatchSizeBytes = builder.maxBatchSizeBytes
    this.typeFn = builder.typeFn
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
          this.idFn = builder.idFn
          this.indexFn = builder.indexFn
          this.maxBatchSize = builder.maxBatchSize
          this.maxBatchSizeBytes = builder.maxBatchSizeBytes
          this.typeFn = builder.typeFn
          this.usePartialUpdate = builder.usePartialUpdate
        }
      }

      setConnectionConfiguration(connectionConfiguration) {
        this.connectionConfiguration = connectionConfiguration
        return this
      }

      setIdFn(idFn) {
        this.idFn = idFn
        return this
      }

      setIndexFn(indexFn) {
        this.indexFn = indexFn
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

      setTypeFn(typeFn) {
        this.typeFn = typeFn
        return this
      }

      setUsePartialUpdate(usePartialUpdate=true) {
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
   * Provide a function to extract the id from the document. This id will be used
   * as the document id in ElasticSearch. Should the function throw an Exception
   * then the batch will fail and the exception propagated.
   *
   * @param idFn to extract the document ID
   * @return the {@link Write} with the function set
   */

  withIdFn(idFn) {
    checkArgument(idFn !== null, 'idFn can not be null')
    return this.builder()
    .setIdFn(idFn)
    .build()
  }

  /**
   * Provide a function to extract the target index from the document allowing
   * for dynamic document routing. Should the function throw an Exception then
   * the batch will fail and the exception propagated.
   *
   * @param indexFn to extract the destination index from
   * @return the {@link Write} with the function set
   */

  withIndexFn(indexFn) {
    checkArgument(indexFn !== null, 'indexFn can not be null')
    return this.builder()
    .setIndexFn(indexFn)
    .build()
  }

  /**
   * Provide a function to extract the target type from the document allowing
   * for dynamic document routing. Should the function throw an Exception then
   * the batch will fail and the exception propagated. Users are encouraged to
   * consider carefully if multipe types are a sensible model
   * <a
   * href="https://www.elastic.co/blog/index-type-parent-child-join-now-future-in-elasticsearch">as
   * discussed in this blog</a>.
   *
   * @param typeFn to extract the destination index from
   * @return the {@link Write} with the function set
   */

  withTypeFn(typeFn) {
    checkArgument(typeFn !== null, 'typeFn can not be null')
    return this.builder()
    .setTypeFn(typeFn)
    .build()
  }

  /**
   * Provide an instruction to control whether partial updates or inserts (default) are issued to
   * ElasticSearch.
   *
   * @param usePartialUpdate set to true to issue partial updates
   * @return the {@link Write} with the partial update control set
   */
  withUsePartialUpdate(usePartialUpdate) {
    return this.builder()
    .setUsePartialUpdate(usePartialUpdate)
    .build()
  }

  /**
   * expand() is called in the pipeline building phase and replaces a node
   * in the graph with something more complex:
   */

  expand(pipeline) {

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
    pipeline.apply(ParDo.of(new WriteFn(this)))
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
