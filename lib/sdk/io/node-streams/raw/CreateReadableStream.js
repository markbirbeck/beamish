const debug = require('debug')('CreateReadableStream')
const stream = require('stream')

class CreateReadableStream extends stream.Readable {
  constructor(elems) {
    super({ objectMode: true })
    debug(`Initialising: ${JSON.stringify(elems)}`)
    this.elems = elems
    this.next = 0
  }

  _read() {
    if (this.next === this.elems.length) {
      debug(`Finished after ${this.elems.length} elements`)
      this.push(null)
    } else {
      const elem = this.elems[this.next++]
      debug(`Pushing: ${JSON.stringify(elem)}`)
      this.push(elem)
    }
  }
}

module.exports = CreateReadableStream
