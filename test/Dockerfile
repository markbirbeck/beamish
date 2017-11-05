FROM beamish:latest

# ...Mocha, Chai and friends
RUN npm install -g \
  chai \
  chai-http \
  chai-as-promised \
  mocha

# Launch the app:
#
CMD ["/bin/sh", "-c", "mocha --watch --recursive --timeout 30000 --reporter min"]
