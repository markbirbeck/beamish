const tap = require('tap')
tap.comment('MySqlIO#read() large query count')

/**
 * Set up a pipeline that:
 *
 *  - queries the database for employees;
 *  - counts the number of records;
 *  - checks the count.
 */

const Count = require('../../../../lib/sdk/transforms/Count');
const DoFn = require('../../../../lib/sdk/transforms/DoFn');
const MySqlIO = require('../../../../lib/sdk/io/MySqlIO')
const Pipeline = require('../../../../lib/sdk/Pipeline');
const ParDo = require('../../../../lib/sdk/transforms/ParDo');

const main = async () => {
  return Pipeline.create()
  .apply(
    'MySQL',
    MySqlIO
    .read()
    .withConnectionConfiguration({
      host: 'db',
      user: 'root',
      password: 'college',
      database: 'employees'
    })
    .withQuery('SELECT * FROM employees;')
  )

  /**
   * Count the number of records returned and check the results:
   */

  .apply(Count.globally())
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
         *      equal() {
         *        return 77
         *      }
         *    }
         *  ))
         */

        return require('tap').equal(input, 300024)
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
    tap.test({timeout: 180000}, t => {
      t.resolves(main())
      t.end()
    })
  }
)
