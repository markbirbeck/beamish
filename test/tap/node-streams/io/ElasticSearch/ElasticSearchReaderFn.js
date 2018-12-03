const tap = require('tap')
tap.comment('ElasticSearchReaderFn')

const path = require('path')
const Count = require('./../../../../../lib/sdk/transforms/node-streams/Count')
const DoFn = require('./../../../../../lib/sdk/harnesses/node-streams/DoFn')
const ElasticSearchReaderFn = require('./../../../../../lib/sdk/io/node-streams/ElasticSearchReaderFn')
const ElasticSearchWriterFn = require('./../../../../../lib/sdk/io/node-streams/ElasticSearchWriterFn')
const FileReaderFn = require('./../../../../../lib/sdk/io/node-streams/FileReaderFn')
const FileWriterFn = require('./../../../../../lib/sdk/io/node-streams/FileWriterFn')
const ParDo = require('./../../../../../lib/sdk/harnesses/node-streams/ParDo')
const Pipeline = require('./../../../../../lib/sdk/NodeStreamsPipeline')

const main = async () => {
  /**
   * First write some data to the ElasticSearch server:
   */

  let p = Pipeline.create()

  p
  .apply(
    ParDo.of(new FileReaderFn(path.resolve(__dirname,
      '../../../../fixtures/shakespeare/1kinghenryiv')))
  )
  .apply(
    ParDo.of(
      new class ExtractWordsFn extends DoFn {
        processElement(c) {
          c.element()
          .split(/[^\S]+/)
          .forEach(word => word.length && c.output(word))
        }
      }(false)
    )
  )
  .apply(Count.globally())
  .apply(
    ParDo.of(
      new class extends DoFn {
        processElement(c) {
          c.output({
            words: Number(c.element())
          })
        }
      }
    )
  )
  .apply(
    ParDo.of(new ElasticSearchWriterFn({
      connection: {
        host: 'http://elasticsearch:9200'
      },
      idFn: () => '1kinghenryiv',
      type: 'WordCount',
      index: 'shakespeare'
    }))
  )

  await p
  .run()
  .waitUntilFinish()

  /**
   * Now we can read the data back:
   */

  p = Pipeline.create()

  p
  .apply(
    ParDo.of(new ElasticSearchReaderFn({
      connection: {
        host: 'http://elasticsearch:9200'
      },
      query: {
        index: 'shakespeare',
        q: '_id:1kinghenryiv'
      }
    }))
  )
  .apply(ParDo.of(new class extends DoFn {
    processElement(c) {
      tap.same(c.element(), {words: 26141})
    }
  }))
  .apply(
    ParDo.of(new FileWriterFn(path.resolve(__dirname,
      '../../../../fixtures/output/temporary-dummy-output')))
  )

  return p
  .run()
  .waitUntilFinish()
}

const waitOn = require('wait-on')
waitOn(
  {
    resources: ['http://elasticsearch:9200'],
    timeout: 60000
  },
  err => {
    if (err) { throw err }
    tap.comment('ES is now ready')
    tap.test({timeout: 60000}, async t => {
      await main()
      t.end()
    })
  }
)
