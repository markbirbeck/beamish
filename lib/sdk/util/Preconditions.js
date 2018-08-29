class IllegalArgumentError extends TypeError {
  constructor(...args) {
    super(...args)
    this.name = this.constructor.name
  }
}

class IllegalStateError extends TypeError {
  constructor(...args) {
    super(...args)
    this.name = this.constructor.name
  }
}

class Preconditions {
  static checkArgument(expression, errorMessage) {
    if (!expression) {
      throw new IllegalArgumentError(errorMessage)
    }
  }

  static checkState(expression, errorMessage) {
    if (!expression) {
      throw new IllegalStateError(errorMessage)
    }
  }
}

module.exports = Preconditions
