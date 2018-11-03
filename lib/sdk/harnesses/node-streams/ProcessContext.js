class ProcessContext {
  constructor(stream, element, encoding) {
    this._stream = stream
    this._element = element
    this._encoding = encoding
    this._lastPush = false
  }

  element() {
    return this._encoding === 'buffer' ? this._element.toString() : this._element
  }

  output(obj) {
    this._lastPush = this._stream.push(obj)
  }
}

module.exports = ProcessContext
