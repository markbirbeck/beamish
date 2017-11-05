class PipelineOptions {
  constructor() {
    this.runner = 'direct/DirectRunner';
  }

  setRunner(runner) {
    this.runner = runner;
    return this;
  }
}

exports.create = () => {
  return new PipelineOptions();
}
