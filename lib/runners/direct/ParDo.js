/**
 * This module is not referenced in this file but will be referenced by
 * the user-defined classes that we're running:
 */

const DoFn = require('./DoFn');

class ParDo {
  of(source) {
    let parsedObject = eval(`new ${source}`);

    return parsedObject.processElement.bind(parsedObject);
  }
};

module.exports = () => new ParDo();
