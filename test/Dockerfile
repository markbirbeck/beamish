FROM beamish:latest

# Install app dependencies as global node modules:
#
ENV NODE_PATH /usr/local/lib/node_modules

# ...Mocha, Chai and friends
RUN npm install -g \
  chai \
  chai-http \
  chai-as-promised \
  mocha

# Launch the app:
#
CMD ["mocha", "--watch"]
