const DoFn = require('../../transforms/DoFn')

/**
 * TODO(MB) This should be based on PTransform.
 */

class WriteFn extends DoFn {
  constructor(spec) {
    super()

    /**
     * This should just be:
     *
     *  this.spec = spec
     *
     * but due to the serialisation functions not being
     * powerful enough yet, we need to unpack the incoming
     * values here:
     */

    if (spec) {
      const config = spec.connectionConfiguration
      this.spec = {
        connectionConfiguration: {
          addresses: config.addresses,
          index: config.index,
          type: config.type
        },
        maxBatchSize: spec.maxBatchSize,
        maxBatchSizeBytes: spec.maxBatchSizeBytes,
        usePartialUpdate: spec.usePartialUpdate
      }
    }
  }

  /**
   * setup() is called right at the beginning of the process:
   */

  setup() {
    const elasticsearch = require('elasticsearch')
    this.client = new elasticsearch.Client({
      /**
       * TODO(MB) Add other options, such as logging level.
       */

      host: this.spec.connectionConfiguration.addresses
    })
  }

  /**
   * processStart() and processFinish() are called once each per bundle:
   */

  processStart() {
    this.batch = []
    this.currentBatchSizeBytes = 0
  }

  async processFinish() {
    await this.flushBatch()
  }

  async teardown() {
    this.client.close()
    delete this.client
  }

  getDocumentMetadata(/*document*/) {
    return '{}'
  }

  async apply(input) {
    const documentMetadata = this.getDocumentMetadata(input)
    const document = JSON.stringify(input)

    // index is an insert/upsert and update is a partial update (or insert if not existing)
    if (this.spec.usePartialUpdate) {
      this.batch.push(
        `{ "update" : ${documentMetadata} }\n{ "doc" : ${document}, "doc_as_upsert" : true }\n"`
      )
    } else {
      this.batch.push(`{ "index" : ${documentMetadata} }\n${document}\n`)
    }

    this.currentBatchSizeBytes += document.length
    if (this.batch.length >= this.spec.maxBatchSize
        || this.currentBatchSizeBytes >= this.spec.maxBatchSizeBytes) {
      await this.flushBatch()
    }
  }

  async flushBatch() {
    if (this.batch.length === 0) {
      return
    }

    /**
     * TODO(MB) This should be in a module but at the moment we haven't
     * quite worked out how modules would be available to the function
     * harness. So for now the easiest thing to do is just put it inline:
     */

    class StringBuilder {
      constructor() {
        this.arr = []
      }

      clear() {
        this.arr.length = 0
      }

      append(s) {
        this.arr.push(s)
        return this
      }

      toString() {
        return this.arr.join('')
      }
    }

    const bulkRequest = new StringBuilder()
    for (const jsonLine of this.batch) {
      bulkRequest.append(jsonLine)
    }
    this.batch.length = 0
    this.currentBatchSizeBytes = 0
    // Elasticsearch will default to the index/type provided here if none are set in the
    // document meta (i.e. using ElasticsearchIO$Write#withIndexFn and
    // ElasticsearchIO$Write#withTypeFn options)
    const response = await this.client.bulk({
      index: this.spec.connectionConfiguration.index,
      type: this.spec.connectionConfiguration.type,
      body: bulkRequest.toString()
    })
  }
}

module.exports = WriteFn
