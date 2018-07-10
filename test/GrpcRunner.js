const path = require('path');
const chai = require('chai');

chai.use(require('chai-as-promised'));
chai.should();

const Count = require('../lib/sdk/transforms/Count');
const MapElements = require('../lib/sdk/transforms/MapElements');
const DoFn = require('../lib/sdk/transforms/DoFn');
const ParDo = require('../lib/sdk/transforms/ParDo');
const Pipeline = require('../lib/sdk/Pipeline');
const PipelineOptionsFactory = require('../lib/sdk/options/PipelineOptionsFactory')
const TextIO = require('../lib/sdk/io/TextIO');

describe('GrpcRunner', () => {
  describe('Beam Word Count', () => {
    /**
     * Disabled until https://gitlab.com/beamish/direct-runner/issues/59
     * is fixed.
     */

    it.skip('minimal', () => {

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

      const options = PipelineOptionsFactory.create().setRunner('grpc/GrpcRunner');

      /**
       * Create the Pipeline object with the options we defined above:
       */

      const p = Pipeline.create(options);

      /**
       * Apply the pipeline's transforms:
       */

      /**
       * Concept #1: Apply a root transform to the pipeline; in this case,
       * TextIO.Read to read a set of input text files. TextIO.Read returns
       * a PCollection where each element is one line from the input text
       * (a set of Shakespeare's texts).
       */

      /**
       * This example reads a public data set consisting of the complete works
       * of Shakespeare:
       *
       * [TODO] The original examples uses the URL:
       *
       *  gs://apache-beam-samples/shakespeare/*
       */

      /**
       * Note that the path must be resolvable *inside* the gRPC harness, which
       * is created with Dockerfile-FnHarness.
       */

      p.apply(TextIO.read().from('/usr/src/app/test/fixtures/shakespeare/1kinghenryiv'))

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

      /**
       * Concept #4: Apply a write transform, TextIO.Write, at the end of the
       * pipeline. TextIO.Write writes the contents of a PCollection (in this
       * case, our PCollection of formatted strings) to a series of text files.
       *
       * By default, it will write to a set of files with names like
       * wordcount-00001-of-00005
       */

      .apply(TextIO.write().to('wordcounts'))
      ;

      /**
       * Run the pipeline:
       */

      return p.run().waitUntilFinish();
    });
  });
});
