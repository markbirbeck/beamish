/**
 * This is not the same as Java's AutoValue but it will do for now.
 *
 * In the Java version they introspect for properties and then generate functions,
 * but it's not so easy in JS-world. There is probably a solution, but for now the
 * easiest way to create something useful is to look for methods like 'getName()'
 * and 'getNumberOfLegs()', and use those to signify properties of interest.
 */

 const AutoValue = klass => {
  const C = class {
    constructor(builder) {
      if (builder) {
        this.copyFromBuilder(builder)
      }
    }

    build() {
      return new klass(Object.entries(this))
    }
  }

  let copyFn = ''
  const getters = Object.getOwnPropertyNames(klass.prototype)
  for (let getter of getters) {
    if (getter.substring(0, 3) === 'get') {
      const propName = getter.substring(3)
      const setter = `set${propName}`
      C.prototype[setter] = function(prop) {
        this[propName.toLowerCase()] = prop
        return this
      }
      copyFn += `this.${propName.toLowerCase()} = builder.${getter}()\n`
    }
  }

  C.prototype.copyFromBuilder = new Function('builder', copyFn)

  return C
}

module.exports = AutoValue
