const tap = require('tap')
tap.comment('UnzipReaderFn')

const path = require('path')
const stream = require('stream')
const yauzl = require('yauzl')

const Count = require('./../../../../lib/sdk/transforms/node-streams/Count')
const DoFn = require('./../../../../lib/sdk/harnesses/node-streams/DoFn')
const FileWriterFn = require('./../../../../lib/sdk/io/node-streams/FileWriterFn')
const ParDo = require('./../../../../lib/sdk/harnesses/node-streams/ParDo')
const Pipeline = require('./../../../../lib/sdk/NodeStreamsPipeline')
const Split = require('./../../../../lib/sdk/transforms/node-streams/Split')

class UnzipReaderFn extends DoFn {
  constructor(fileName) {
    super()
    this.objectMode = true
    this.fileName = fileName
  }

  async setup() {
    this.stream = await new Promise((resolve, reject) => {
      yauzl.open(this.fileName, { lazyEntries: true }, (err, zipFile) => {
        if (err) reject(err)
        else {
          zipFile.readEntry()
          zipFile.on('entry', entry => {
            /**
             * If the next entry is a directory then skip:
             */

            if (/\/$/.test(entry.fileName)) {
              zipFile.readEntry()
            }

            /**
             * If the next entry is a file then we have our stream:
             */

            else {
              zipFile.openReadStream(entry, (err, readStream) => {
                if (err) reject(err)
                else {
                  resolve(readStream)
                }
              })
            }
          })
        }
      })
    })
  }
}

const main = async () => {
  const p = Pipeline.create()

  p
  .apply(
    ParDo.of(
      new UnzipReaderFn(path.resolve(__dirname, '../../../fixtures/file2.txt.zip'))
    )
  )
  .apply(ParDo.of(new Split()))
  .apply(Count.globally())
  .apply(
    ParDo.of(new class extends DoFn {
      constructor() {
        super()
        this.objectMode = true
      }

      processElement(c) {
        c.output(
          tap.same(c.element(), 6).toString()
        )
      }
    })
  )
  .apply(
    ParDo.of(new FileWriterFn(path.resolve(__dirname,
      '../../../fixtures/output/create')))
  )

  return p
  .run()
  .waitUntilFinish()
}

tap.resolves(main())
