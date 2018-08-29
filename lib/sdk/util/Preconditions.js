class Preconditions {
  static checkArgument(expression, errorMessage) {
    if (!expression) {
      throw new Error(errorMessage)
    }
  }
}

module.exports = Preconditions
