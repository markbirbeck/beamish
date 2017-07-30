FROM node:alpine

# Create app directory and set as working directory:
#
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

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
