const fetch = require('node-fetch')

const DoFn = require('./../../harnesses/direct/DoFn')

class RequestReaderFn extends DoFn {
  constructor(url, json=false) {
    super()
    this.url = url
    this.json = json
  }

  async setup() {
    const res = await fetch(this.url)
    if (this.json) {
      const CreateReadableStream = require('./raw/CreateReadableStream')
      this.stream = new CreateReadableStream([await res.json()])
    } else {
      this.stream = res.body
    }
  }
}

module.exports = RequestReaderFn
