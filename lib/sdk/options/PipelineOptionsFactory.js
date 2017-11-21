class PipelineOptions {
  constructor() {
    this.runner = 'direct/DirectRunner';
  }

  setHarness(harness) {
    this.harness = harness;
    return this;
  }

  setImage(image) {
    this.image = image;
    return this;
  }

  setRunner(runner) {
    this.runner = runner;
    return this;
  }
}

exports.create = () => {
  return new PipelineOptions();
}
