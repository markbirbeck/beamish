FROM node:10.9.0-alpine

# Create app directory and set as working directory:
#
WORKDIR /usr/src/app

# We need '-unsafe-perm' as described here:
#
#  https://github.com/grpc/grpc/issues/6435
#
COPY package.json /usr/src/app
RUN npm install -unsafe-perm

# Bundle app source
#
COPY . /usr/src/app
