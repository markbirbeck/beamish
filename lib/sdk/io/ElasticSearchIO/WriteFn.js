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
          requestTimeout: config.requestTimeout,
          type: config.type
        },
        idFn: spec.idFn,
        indexFn: spec.indexFn,
        maxBatchSize: spec.maxBatchSize,
        maxBatchSizeBytes: spec.maxBatchSizeBytes,
        typeFn: spec.typeFn,
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

      host: this.spec.connectionConfiguration.addresses,
      requestTimeout: this.spec.connectionConfiguration.requestTimeout
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

  /**
   * Extracts the components that comprise the document address from the document
   * using the {@link FieldValueExtractFn} configured. This allows any or all of
   * the index, type and document id to be controlled on a per document basis.
   * If none are provided then an empty default of {@code {}} is returned.
   * Sanitization of the index is performed, automatically lower-casing the value
   * as required by Elasticsearch.
   *
   * @param document the json from which the index, type and id may be extracted
   * @return the document address as JSON or the default
   * @throws IOException if the document cannot be parsed as JSON
   */

  getDocumentMetadata(document) {
    const spec = this.spec

    if (!spec.indexFn && !spec.typeFn && !spec.idFn) {
      return '{}'
    }

    const metadata = {
      _id: spec.idFn && spec.idFn(document),
      _index: spec.indexFn && WriteFn.lowerCaseOrNull(spec.indexFn(document)),
      _type: spec.typeFn && spec.typeFn(document),
      retry_on_conflict: spec.usePartialUpdate && WriteFn.DEFAULT_RETRY_ON_CONFLICT
    }

    /**
     * This relies on 'undefined' values getting stripped out of the JSON above:
     */

    return JSON.stringify(metadata);
  }

  static lowerCaseOrNull(input) {
    return input && input.toLowerCase()
  }

  async processElement(c) {
    const input = c.element()
    const documentMetadata = this.getDocumentMetadata(input)
    const document = JSON.stringify(input)

    // index is an insert/upsert and update is a partial update (or insert if not existing)
    if (this.spec.usePartialUpdate) {
      this.batch.push(`
        { "update" : ${documentMetadata} }
        { "doc" : ${document}, "doc_as_upsert" : true }
      `)
    } else {
      this.batch.push(`
        { "index" : ${documentMetadata} }
        ${document}
      `)
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

WriteFn.DEFAULT_RETRY_ON_CONFLICT = 5

module.exports = WriteFn
