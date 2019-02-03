const tap = require('tap')
tap.comment('ElasticSearchReaderFn')

const fs = require('fs')
const path = require('path')
const {
  Count,
  DoFn,
  ElasticSearchReaderFn,
  ElasticSearchWriterFn,
  FileWriterFn,
  ParDo,
  Pipeline,
  TextIO
} = require('../../../../../')

const main = async () => {
  /**
   * First write some data to the ElasticSearch server:
   */

  let p = Pipeline.create()

  p
  .apply(
    TextIO.read().from(path.resolve(__dirname,
      '../../../../fixtures/shakespeare/1kinghenryiv'))
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
      refresh: true,
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
      c.output(tap.same(c.element(), {words: 26141}).toString())
    }
  }))
  .apply(
    ParDo.of(new FileWriterFn(path.resolve(__dirname,
      '../../../../fixtures/output/elasticsearch-readerfn')))
  )

  return p
  .run()
  .waitUntilFinish()
}

const waitOn = require('wait-on')
waitOn(
  {
    resources: ['http://elasticsearch:9200'],
    timeout: 90000
  },
  err => {
    if (err) { throw err }
    tap.comment('ES is now ready')
    tap.test({timeout: 60000}, async t => {
      await main()

      /**
       * Check the output to the saved file, since if there
       * are no records returned from the search then the
       * tap test is not actually run:
       */
      const stat = fs.statSync(path.resolve(__dirname,
        '../../../../fixtures/output/elasticsearch-readerfn'))
      tap.same(stat.size, 'true'.length)

      t.end()
    })
  }
)
