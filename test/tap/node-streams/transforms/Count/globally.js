const tap = require('tap')
tap.comment('Count#globally')

const path = require('path')
const fs = require('fs')

/**
 * Set up a pipeline that:
 *
 *  - reads lines from a file;
 *  - splits each line into its words;
 *  - counts the total number of words;
 *  - checks the count.
 */

const {
  Count,
  DoFn,
  FileReaderFn,
  FileWriterFn,
  NodeStreamsHarness,
  ParDo
} = require('../../../../../')

const main = async () => {
  const graph = [
    ParDo.of(new FileReaderFn(path.resolve(__dirname,
      '../../../../fixtures/shakespeare/1kinghenryiv'))),
    ParDo.of(
      new class ExtractWordsFn extends DoFn {
        processElement(c) {
          c.element()
          .split(/[^\S]+/)
          .forEach(word => word.length && c.output(word))
        }
      }(false)
    ),
    Count.globally(),
    ParDo.of(new FileWriterFn(path.resolve(__dirname,
      '../../../../fixtures/output/1kinghenryiv')))
  ]

  try {
    const harness = new NodeStreamsHarness()
    harness.register(graph)

    await harness.processBundle()

    const stat = fs.statSync(path.resolve(__dirname,
      '../../../../fixtures/output/1kinghenryiv'))
    tap.same(stat.size, 5)
  } catch (err) {
    console.error('Pipeline failed', err)
  }
}

main()
