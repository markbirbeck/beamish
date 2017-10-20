FROM node:alpine

# Install app dependencies as global node modules:
#
ENV NODE_PATH /usr/local/lib/node_modules

# Create app directory and set as working directory:
#
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Required by gRPC when running on Alpine:
#
RUN apk add --no-cache \
  libc6-compat

# Bundle app source
#
COPY . /usr/src/app

# We need '-unsafe-perm' as described here:
#
#  https://github.com/grpc/grpc/issues/6435
#
RUN npm install -g -unsafe-perm
