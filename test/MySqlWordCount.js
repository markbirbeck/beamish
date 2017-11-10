const chai = require('chai');

chai.use(require('chai-as-promised'));
chai.should();

const Count = require('../lib/sdk/transforms/Count');
const MapElements = require('../lib/sdk/transforms/MapElements');
const DoFn = require('../lib/sdk/transforms/DoFn');
const ParDo = require('../lib/sdk/transforms/ParDo');
const Pipeline = require('../lib/sdk/Pipeline');
const PipelineOptionsFactory = require('../lib/sdk/options/PipelineOptionsFactory')
const MySqlIO = require('../lib/sdk/io/MySqlIO');

class OutputFn extends DoFn {
  processElement(c) {
    console.log(c.element());
  }
}

describe('MySQL Word Count', () => {
  it.only('minimal', () => {

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

    const options = PipelineOptionsFactory.create();

    /**
     * Create the Pipeline object with the options we defined above:
     */

    const p = Pipeline.create(options);

    /**
     * Apply the pipeline's transforms:
     */

    p.apply(
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
      .from()
    )

    /**
     * Extract just the department name:
     */

    .apply('DeptName', ParDo.of(
      new class ExtractDeptNameFn extends DoFn {
        apply(input) {
          return input.dept_name;
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
          ;
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
     * Apply a MapElements transform that formats our PCollection of word
     * counts into a printable string, suitable for writing to an output file:
     */

    .apply('FormatResults', MapElements.via(
      new class SimpleFunction extends DoFn {
        apply(input) {
          return input.getKey() + ': ' + input.getValue();
        }
      }()
    ))

    .apply('Output', ParDo.of(new OutputFn()))
    ;

    /**
     * Run the pipeline:
     */

    return p.run().waitUntilFinish();
  });
});
