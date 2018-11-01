class ProcessContext {
  constructor(stream, element, encoding) {
    this._stream = stream
    this._element = element
    this._encoding = encoding
  }

  element() {
    return this._encoding === 'buffer' ? this._element.toString() : this._element
  }

  output(obj) {
    if (!this._stream.push(obj)) {
      this._stream.pause()
    }
  }
}

module.exports = ProcessContext
