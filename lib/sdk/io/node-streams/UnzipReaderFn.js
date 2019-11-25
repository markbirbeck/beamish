const yauzl = require('yauzl')

const DoFn = require('./../../harnesses/direct/DoFn')

class UnzipReaderFn extends DoFn {
  constructor(fileName) {
    super()
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

module.exports = UnzipReaderFn
