const path = require('path')

const tap = require('tap')
tap.comment('MySqlIO#read()')

/**
 * Set up a pipeline that:
 *
 *  - queries the database for department names;
 *  - splits each department name into words;
 *  - counts the occurrence of each word;
 *  - accumulates the counts in a single JSON object;
 *  - checks the counts.
 */

const Count = require('../../../../lib/sdk/transforms/Count');
const DoFn = require('../../../../lib/sdk/transforms/DoFn');
const MySqlIO = require('../../../../lib/sdk/io/MySqlIO')
const Pipeline = require('../../../../lib/sdk/Pipeline');
const PipelineOptionsFactory = require('../../../../lib/sdk/options/PipelineOptionsFactory')
const ParDo = require('../../../../lib/sdk/transforms/ParDo');

const main = async () => {

  /**
   * Derived from:
   *
   *  https://github.com/apache/beam/blob/master/examples/java/src/main/java/org/apache/beam/examples/MinimalWordCount.java
   */

  /**
   * Create a PipelineOptions object. This object lets us set various
   * execution options for our pipeline, such as the runner you wish
   * to use. This example will run with the DirectRunner by default,
   * based on the class path configured in its dependencies:
   */

  const options = PipelineOptionsFactory.create()

  /**
   * Create the Pipeline object with the options we defined above:
   */

  const p = Pipeline.create(options)

  /**
   * Set up the query:
   */

  return p.apply(
    'MySQL',
    MySqlIO
    .read()
    .withConnectionConfiguration({
      host: 'db',
      user: 'root',
      password: 'college',
      database: 'employees'
    })
    .withQuery('SELECT dept_name FROM departments;')
  )

  /**
   * Extract just the department name:
   */

  .apply('DeptName', ParDo.of(
    new class ExtractDeptNameFn extends DoFn {
      apply(input) {
        return input.dept_name
      }
    }()
  ))

  /**
   * Concept #2: Apply a ParDo transform to our PCollection of text lines.
   * This ParDo invokes a DoFn (defined in-line) on each element that
   * tokenizes the text line into individual words. The ParDo returns a
   * PCollection<String>, where each element is an individual word in
   * Shakespeare's collected texts:
   */

  .apply('ExtractWords', ParDo.of(
    new class ExtractWordsFn extends DoFn {
      processElement(c) {
        c.element()
        .split(/[^\S]+/)
        .forEach(word => word.length && c.output(word))
      }
    }()
  ))

  /**
   * Concept #3: Apply the Count transform to our PCollection of individual
   * words. The Count transform returns a new PCollection of key/value pairs,
   * where each key represents a unique word in the text. The associated
   * value is the occurrence count for that word:
   */

  .apply(Count.perElement())

  /**
   * Accumulate the results into one object:
   */

  .apply(ParDo.of(
    new class extends DoFn {
      processStart() {
        this.results = {};
      }

      processElement(c) {
        const element = c.element()
        this.results[element.getKey()] = element.getValue()
      }

      processFinish(pe) {
        pe.output(this.results);
      }
    }
  ))

  /**
   * Now check the results:
   */

  .apply(ParDo.of(
    new class extends DoFn {
      apply(input) {

        /**
         * TODO(MB): Would be quite simple to set up some kind of 'test' class
         * that already has tap on it. Maybe the class would expose all of the
         * same methods that tap has, so that we could do things like:
         *
         *  .apply(ParDo.of(
         *    new class extends TestDoFn {
         *      same() {
         *        return { a: 2, b: 3 }
         *      }
         *    }
         *  ))
         */

        return require('tap').same(
          input,
          {
            Customer: 1,
            Service: 1,
            Development: 1,
            Finance: 1,
            Human: 1,
            Resources: 1,
            Marketing: 1,
            Production: 1,
            Quality: 1,
            Management: 1,
            Research: 1,
            Sales: 1
          }
        )
      }
    }
  ))
  .run()
  .waitUntilFinish()
}

const waitOn = require('wait-on')
waitOn(
  {
    resources: ['tcp:db:3306'],
    timeout: 60000
  },
  err => {
    if (err) { throw new Error(err) }
    tap.comment('MySQL is now ready')
    tap.resolves(main())
  }
)
