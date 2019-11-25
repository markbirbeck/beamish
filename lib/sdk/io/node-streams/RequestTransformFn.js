const debug = require('debug')('RequestTransformFn')
const fetch = require('node-fetch')

const DoFn = require('./../../harnesses/direct/DoFn')

class RequestTransformFn extends DoFn {
  constructor(json=false) {
    super()
    this.json = json
  }

  async processElement(context) {
    const url = context.element()
    debug('processElement: URL is \'', url, '\'')
    try {
      const res = await fetch(url, { timeout: 2000 })
      const ret = await (this.json ? res.json() : res.text())
      debug.extend('success')(ret)

      context.output(ret)
    } catch(err) {
      debug.extend('error')(err)
    }
  }
}

module.exports = RequestTransformFn
