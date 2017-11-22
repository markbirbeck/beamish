class PipelineOptions {
  constructor() {
    this.runner = 'direct/DirectRunner';
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
