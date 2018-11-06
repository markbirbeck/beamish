const fetch = require('node-fetch')

const DoFn = require('./../../harnesses/node-streams/DoFn')

class RequestReaderFn extends DoFn {
  constructor(url) {
    super()
    this.url = url
  }

  async setup() {
    const res = await fetch(this.url)
    this.stream = res.body
  }
}

module.exports = RequestReaderFn
