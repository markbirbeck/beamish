const ParDo = require('../../transforms/ParDo')
const PTransform = require('../../transforms/PTransform');
const Read = require('../Read');

class RequestIO {
  static get Read() {
    return class _Read extends PTransform {
      static get Builder() {
        return class Builder {
          build() {
            return new _Read();
          }
        };
      }

      withUrl(url) {
        this.url = url;
        return this;
      }

      /**
       * [TODO]: This should take a 'PBegin input' parameter,
       * and then call input.apply().
       */

      expand(input) {
        const RequestSource = require('./RequestSource');

        return input.apply(ParDo.of(Read.from(new RequestSource(this))));
      }
    }
  }

  static read() {
    return new RequestIO.Read.Builder().build();
  }
};

module.exports = RequestIO;
