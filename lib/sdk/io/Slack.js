const DoFn = require('../transforms/DoFn');
const ParDo = require('../transforms/ParDo');

class _Write extends DoFn {
  constructor(webhookUrl) {
    super();
    this.webhookUrl = webhookUrl;
  }

  processStart() {
    const IncomingWebhook = require('@slack/client').IncomingWebhook;

    this.webhook = new IncomingWebhook(this.webhookUrl);
  }

  apply(input) {
    this.webhook.send(input, function(err/*, res*/) {
      if (err) {
        console.log('Error: ', err);
      }
    });
  }

  processFinish() {
    delete this.webhook;
  }
}

class Write {
  static Builder() {
    return new class {
      build() {
        return new Write();
      }
    }();
  }

  to(webhookUrl) {
    return ParDo().of(new _Write(webhookUrl));
  }
}

class Slack {
  static write() {
    return Write.Builder().build();
  }
};

module.exports = Slack;
