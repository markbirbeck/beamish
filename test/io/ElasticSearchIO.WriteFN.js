const path = require('path')

const tap = require('tap')
tap.comment('ElasticSearchIO#write()')

/**
 * Set up a pipeline that:
 *
 *  - takes some sentences;
 *  - splits each sentence into words;
 *  - counts the occurrence of each word;
 *  - creates a JSON object for each word, that contains the word and its
 *    count;
 *  - writes the JSON to ElasticSearch.
 */

const Count = require('../../lib/sdk/transforms/Count');
const Create = require('../../lib/sdk/transforms/Create');
const DoFn = require('../../lib/sdk/transforms/DoFn');
const ElasticSearchIO = require('../../lib/sdk/io/ElasticSearchIO')
const Pipeline = require('../../lib/sdk/Pipeline');
const MapElements = require('../../lib/sdk/transforms/MapElements');
const ParDo = require('../../lib/sdk/transforms/ParDo');

const main = async config => {
  const pipeline = Pipeline.create()

  return pipeline
  .apply(ParDo.of(Create.of([
    'To be, or not to be: that is the question: ',
    'Whether \'tis nobler in the mind to suffer ',
    'The slings and arrows of outrageous fortune, ',
    'Or to take arms against a sea of troubles, '
  ])))
  .apply('ExtractWords', ParDo.of(
    new class ExtractWordsFn extends DoFn {
      processElement(c) {
        c.element()
        .split(/\b/)
        .forEach(word => word.length && c.output(word))
        ;
      }
    }()
  ))
  .apply(Count.perElement())
  .apply(MapElements.via(
    new class extends DoFn {
      apply(input) {
        return {
          word: input.getKey(),
          count: input.getValue()
        }
      }
    }()
  ))
  .apply(ElasticSearchIO.write().withConnectionConfiguration(config))
  .run()
  .waitUntilFinish()
}

/**
 * Use the pipeline above, first with an invalid configuration:
 */

tap.comment('Write to non-existent ES server.')

let config = ElasticSearchIO
.ConnectionConfiguration
.create('http://non-existent-host:9200', 'my-index', 'my-type', 5000)

tap.equal(config.addresses, 'http://non-existent-host:9200')
tap.equal(config.index, 'my-index')
tap.equal(config.requestTimeout, 5000)
tap.equal(config.type, 'my-type')

tap.rejects(main(config))

/**
 * Now use the pipeline with a valid configuration:
 */

tap.comment('Write to a valid ES server.')

config = ElasticSearchIO
.ConnectionConfiguration
.create('http://elasticsearch:9200', 'my-index', 'my-type')

tap.equal(config.addresses, 'http://elasticsearch:9200')
tap.equal(config.index, 'my-index')
tap.equal(config.type, 'my-type')

const waitOn = require('wait-on')
waitOn(
  {
    resources: ['http://elasticsearch:9200'],
    timeout: 60000
  },
  err => {
    if (err) { throw new Error(err) }
    tap.comment('ES is now ready')
    tap.test({timeout: 60000}, t => {
      t.resolves(main(config))
      t.end()
    })
  }
)
