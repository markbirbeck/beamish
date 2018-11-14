const debug = require('debug')('RequestTransformFn')
const fetch = require('node-fetch')

const DoFn = require('./../../harnesses/node-streams/DoFn')

class RequestTransformFn extends DoFn {
  constructor(json=false) {
    super()
    this.json = json
  }

  async processElement(context) {
    const url = context.element()
    debug('processElement: URL is \'', url, '\'')
    const res = await fetch(url)
    const ret = await (this.json ? res.json() : res.text())
    debug('processElement: returned \'', ret, '\'')

    context.output(ret)
  }
}

module.exports = RequestTransformFn
