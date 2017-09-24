FROM node:alpine

# Install app dependencies as global node modules:
#
ENV NODE_PATH /usr/local/lib/node_modules

# Create app directory and set as working directory:
#
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Bundle app source
#
COPY . /usr/src/app
