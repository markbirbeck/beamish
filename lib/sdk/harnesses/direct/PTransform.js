/**
 * The DoFn module is not referenced in this file but it will be referenced
 * by the user-defined classes that we're running:
 */

const BoundedSource = require('../../io/BoundedSource');
const DoFn = require('./DoFn');
const ParDo = require('./ParDo');

const Serializable = require('../../io/Serializable');

class PTransform extends Serializable {
  constructor(source) {
    super();
    let parsedObject = eval(`${source}`);

    return parsedObject;
  }
};

module.exports = PTransform;
