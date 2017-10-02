/**
 * The DoFn module is not referenced in this file but it will be referenced
 * by the user-defined classes that we're running:
 */

const DoFn = require('./DoFn');

class PTransform {
  constructor(source) {
    let parsedObject = eval(`${source}`);

    return parsedObject;
  }
};

module.exports = PTransform;
